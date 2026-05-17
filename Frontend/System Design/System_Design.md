# GreatFrontend System Design

### Web News Feed

**Design a web news feed application that letss users browse a feed of posts, react to posts, and create new posts. Assume the feed primarily contains text and image posts. Focus on the front-end architecture and the client/server contract for loading, rendering, and updating the feed.**

**Requirements**

- Render the initial feed quickly and load more posts as the user scrolls.
- Support common feed interactions such as reactions and post creation.
- Handle long-lived sessions, stale data, and common feed performance concerns.
- You do not need to go deep on feed ranking, ads delivery, or the full back-end fan-out/pull architecture

#### Solution

**Assumptions:**

1. Should the UI component displaying a single feed data occupy the whole viewport? I am assuming no
2. Backend returns:

- GET - list of news feed items with pagination
- POST request apis for liking and feed reacting
- Most performance concerns related to feed is handled via caching and cache invalidation. For this, libraries like RTK Query and Tanstack Query are a good choice
- For liking and reacting, use optimistic UI update. Again, libraries like RTK Query and Tanstack Query provide structured life cycles to implement this exactly
- Assuming cursor based pagination

**Questions:**

1. What kind of posts are supported - what does backend send in the data?
2. What pagination UX should be used for the feed?
3. What exactly do you want to display in a long-lived session? Can you defined the min-duration above which the session can be identified as _long-lived_?
4. Will the application be used for mobiles? Is mobile responsiveness a mandate?
5.

**Steps after clarificaitons**

1. For this, SPA is a good choice. The post would contain author data, text, media, etc which can be stored in a state / store. This data doesn't need to be fetched again when opening the details of the feed / post. If using MPA, opening the details of a feed, would destroy all in-memory data and rebuild the web-page from scratch - an SSR for each page.

2. Component development - I would start by separating the presentational components and the container components. Here, as far as I see, the presentational component is a card displaying feed profile image, feed header, feed content, meta data - author,time, etc, a togglable comments section with reply. Let's call this `<FeedCard />` with the following prop interface mentioned in data flow section.

The container component, say `<FeedCardContainer />` renders the presentational `<FeedCard />`.

```

<!-- To Do: The interface of this is undefined as I don't know the structure of comments in Comment -->

const [fetchedComments, setFetchedComments] = useState<{id: number; comment: Comment[]}>([]);

// NOTE: Wrap it in useCallback as it's called for each block
const handleCommentToggle = (isOpen: boolean, postId: number) => {
// Make get-comment api call for that post
}

const handleLiked = (liked: boolean, postId: number) => {
// Make post api call to update like-status
}

const handleDisliked = (disliked: boolean, postId: number) => {
// Make post api call to update dislike-status
}

<div className="feed-card-container__wrapper">
{feedData.map((item) => (
    {/* Pass all props */}
    <FeedData   comments ={fetchedComments.find((com) => com.id === item.id).comments}/>
))}
<span className="spinner" />
</div>
```

3. Store - source of truth for client-side state. For simplicity, I am assuming the container component has a state which holds all the feed data and makes the first api call to display initial feed data.

4. API service - Using libraries like RTK or using fetch and a custom object called feedServiceApi with all the necessary api calls as properties. Handles any required data-transformations. But I'd prefer the library cause of built-in optimistic UI update and cache invaliation structures

5. Data flow and API Contract - the container component calls the get api which contains

```
{
    cursor: string;
    total_pages: number;
    results:  string[] OR Post[]
}

```

`results` can be an array of post ids which need to be called initially, or an array of Post data itself.

Since this is the a feed data, it doesn't need to be stored centrally.
If `results: string[]`, then we need to make an api call to each post-id. Can be achieved via `Promise.all()`. The result (after any necessary transformation) is stored in the `feedData` state within the `<FeedCardContainer />`.
If `results: Post[]`, then the data can be stored in the `feedData` state directly within the `<FeedCardContainer />`.

The `feedData` state is mapped through to render the `<FeedCard />`. The `onToggleCommentBlock` callback is passed through makes the api call for the corresponding post's comment section. This data is stored in a local state having `FetchedComment` interface. Using feed-id and `.find()`, the corresponding `comment: Comment` is passed to `<FeedCard />`

```
// FeedCardContainers
interface FetchedComment {
id: number; // post-id to identify which post's comment
comment: Comment[]; // empty array indicates 0 comment
}

interface Engagement {
id: number;
likes: number;
dislikes: number;
commentCount: number;
shareCount: number;
}

interface Post {
id: number;
title: string;
displayImage: string; // url
content: string;
metaData: {
time: string;
author: string;
};
engagement: Engagement;
createdAt: string;
}

```

```

// FeedCard
interface Comment {
id: number;

<!-- To Do: You need to help me with this as I don't know how to render a list of seemingly infinite replies -->

}

interface Engagement {
id: number;
likes: number;
dislikes: number;
commentCount: number;
shareCount: number;
}

interface FeedCardProps {
id: number;
title: string;
displayImg: string;
metaData: {
author: string;
time: string;
};
engagement: Engagement;
onToggleCommentBlock: (isOpen: boolean, postId: number) => {};
comments: Comment[];
onLike: (liked: boolean, postId: number) => {}
onDislike: (disliked: boolean, postId: number) => {}
}
```

6. State Management - Two types of states: local to a component - state within `FeedCardContainer` and `FeedCard`; global state - if any authentication is required which returns globally relevant data like user details - name, displayImg, friends, etc.
   - FeedCardContainer - fetchedComment, posts, ref for intersection observer to call the api when the spinner at the bottom of `<div className="feed-card-container__wrapper>` appears into viewport for lazy-loading / infinite loading
   - FeedCard - `isCommentBlockOpen`, `liked`, `disliked`. liked and disliked states can be skipped if we're using a library like RTK Query where optimistic UI update can be handled (not sure about this as I need to check the exact signature of the life-cycle function)
   - Global store - for global data and for api library setup if using it

7. Performance:
   - Use `useCallback` for callbacks in `FeedCardContainer`
   - Caching and cache invalidation of of api data in client-side
   - For long-lived sessions, I'd periodically refetch or invalidate cached dat to avoid staleness

8.
