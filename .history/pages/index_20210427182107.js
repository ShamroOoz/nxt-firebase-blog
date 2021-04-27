import PostFeed from "@/components/PostFeed";
import Loader from "@/components/Loader";
import Metatags from "@/components/Metatags";
import { firestore, fromMillis, postToJSON } from "@/lib/firebase";

import { useState } from "react";

export default function Home({ data }) {
  //
  const [posts, setPosts] = useState(data);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    const last = posts[posts.length - 1];

    console.log(last);
    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const query = firestore
      .collectionGroup("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(cursor)
      .limit(process.env.NEXT_PUBLIC_LIMIT);

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);
  };

  return (
    <main>
      <Metatags />
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && "You have reached the end!"}
    </main>
  );
}

export async function getServerSideProps(context) {
  const postsQuery = firestore
    .collectionGroup("posts")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(process.env.NEXT_PUBLIC_LIMIT);

  const data = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { data }, // will be passed to the page component as props
  };
}
