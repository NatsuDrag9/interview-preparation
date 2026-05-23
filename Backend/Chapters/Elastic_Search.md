## Elastic Search

Elastic search was developed to reduce latency and increase accuracy of search results in applications.

**Inverted Index** - An inverted index is a database data structure that maps individual words (tokens) to the specific documents or database rows that contain them. It is the core mechanism behind fast full-text search engines like Elasticsearch.

### The Textbook Analogy

Imagine you are looking for the word "Caching" in a 500-page textbook:
* **The Forward Search Approach:** You read the textbook from page 1 to page 500, checking every sentence on every page. This is extremely slow and inefficient.
* **The Inverted Index Approach:** You flip to the back of the book to the **Index section**. You look up the alphabetical entry for "Caching" and see: `Caching: pages 42, 112, 340`. You immediately flip to those pages.

An inverted index is exactly like the index at the back of a textbook.

---

### Step-by-Step Example

Suppose we have two simple documents in our database:
* **Document 1 (Doc 1):** "I love backend development"
* **Document 2 (Doc 2):** "Backend development is fun"

#### Step 1: Tokenization and Normalization
The search engine processes the text by splitting it into lowercase words (tokens) and removing common punctuation:
* Doc 1: `["i", "love", "backend", "development"]`
* Doc 2: `["backend", "development", "is", "fun"]`

#### Step 2: Building the Inverted Index
Instead of storing the data as *Documents containing lists of words*, the engine inverts it to store *Words pointing to lists of Document IDs*:

| Term (Word) | Document List (Postings List) |
|---|---|
| backend | Doc 1, Doc 2 |
| development | Doc 1, Doc 2 |
| fun | Doc 2 |
| i | Doc 1 |
| is | Doc 2 |
| love | Doc 1 |

---

### How Search Executes (Why it is so fast)

If a user searches for the query **"backend fun"**:
1. The search engine splits the query into terms: `"backend"` and `"fun"`.
2. It looks up both terms in the inverted index table (an O(1) key-value lookup):
   * `"backend"` ➔ `[Doc 1, Doc 2]`
   * `"fun"` ➔ `[Doc 2]`
3. It performs a fast set intersection or union on the Document lists:
   * **AND Search (both terms present):** Intersection of `[Doc 1, Doc 2]` and `[Doc 2]` is `[Doc 2]`.
   * **OR Search (either term present):** Union of `[Doc 1, Doc 2]` and `[Doc 2]` is `[Doc 1, Doc 2]`.
4. It returns the matching documents instantly without ever scanning the raw text of the documents themselves.

---

### Relevance Scoring

Once matching documents are found, the search engine ranks them using a **Relevance Score** (typically powered by algorithms like TF-IDF or BM25). This determines the order in which results are displayed so that the most helpful document appears first.

The score is calculated using two simple concepts:

1. **Term Frequency (TF) - "How much does this document talk about the search term?"**
   * If a document mentions the word "caching" 5 times, it is probably more relevant than a document that only mentions it once. 
   * **Rule:** More occurrences in a single document = Higher score.

2. **Inverse Document Frequency (IDF) - "How unique or rare is the search term across the entire database?"**
   * Common words like "is", "in", or "the" appear in almost every document. They have **low IDF** because they do not help narrow down the search.
   * Specific words like "elasticsearch" or "redis" appear in very few documents. They have **high IDF** because they are highly unique and carry more weight.
   * **Rule:** Rarer words database-wide = Higher importance weight.

**Simplified Formula:** `Relevance Score = TF * IDF` (A document scores highest if it contains a rare search term multiple times).

---

### Real-World Example

Suppose a user searches for the query **"caching in Node.js"** across our database. The query has three terms: `"caching"`, `"in"`, and `"node.js"`.

#### 1. The Importance Weight (IDF) of each term:
* `"in"` is extremely common (appears in 100% of documents) ➔ **Almost 0 weight** (low IDF).
* `"caching"` is moderately rare (appears in 15% of documents) ➔ **Medium weight** (medium IDF).
* `"node.js"` is highly specific (appears in only 2% of documents) ➔ **High weight** (high IDF).

#### 2. Let's compare two matching documents:
* **Document A:** *"This is a long article about caching. It shows caching techniques in Java."*
  * `"caching"` appears **twice** (TF = 2).
  * `"in"` appears **once** (TF = 1).
  * `"node.js"` appears **zero times** (TF = 0).
* **Document B:** *"This article explains caching in Node.js. Node.js is great."*
  * `"caching"` appears **once** (TF = 1).
  * `"in"` appears **once** (TF = 1).
  * `"node.js"` appears **twice** (TF = 2).

#### 3. The Result:
Even though **Document A** mentions the word `"caching"` more times, **Document B** wins because it contains the term `"node.js"`. Since `"node.js"` is a rare term with a **high IDF weight**, matching it twice gives Document B an exponentially higher overall relevance score than Document A. Document B is ranked first in the search results.


### BM25 Algorithm Categories to Search

- **Term Frequency (TF)**: How often a term appears in a document.
- **Document Frequency**: How common the term is across all documents.
- **Document Length Normalization**: Penalizes longer documents because they have more words, reducing the chance of a random match.
- **Field Boosting**: Boosts the score of terms that appear in more important fields (e.g., title vs body).


### Use cases

- **Typo Tolerance**: Allows users to make spelling mistakes while searching.
