import * as Post from '../models/post.es6';
import Bus, {Events} from '../dispatchers/main-bus.es6';

export async function createPost(userId, {description, coordinates, image, start, end}) {
  return await Post.create(String(userId), {description, coordinates, image, start, end});
}

export async function findActivePosts(coordinates, count = 10) {
  let posts = await Post.findByLocation(coordinates, 2, true);

  if (posts.length < count) {
    posts = posts.concat(await Post.find({national: true}, true));
  }

  return posts.splice(0, count);
}

export async function updatePost(id, attrs) {
  return await Post.findByIdAndUpdate(id, attrs);
}

export async function verifyPost(id) {
  const prevPost = await Post.findById(id);

  if (prevPost.verified) {
    return prevPost;
  }

  const post = await updatePost(id, {verified: true});

  Bus.emit(Events.CORE_POST_VERIFIED, post);

  return post;
}

export async function getPost(id) {
  return await Post.findById(id);
}

export async function getPosts() {
  return await Post.find();
}

export async function removePost(id, reason) {
  if (!reason) {
    throw Error('Must define reason for deleting post');
  }

  const prevPost = await Post.findById(id);

  if (prevPost.deleted) {
    return prevPost;
  }

  const post = await Post.remove(id, reason);

  Bus.emit(Events.CORE_POST_DELETED, post, reason);

  return post;
}
