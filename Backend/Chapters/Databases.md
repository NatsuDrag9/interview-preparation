## Databases

The core purpose of a database is to ensure data persists through sessions or even after the program that creates it stops running. The state of the data remains the same.

A database basically means a persistence system / layer which provides CRUD operations. In backend, database correspond to disk-based storage - hard disk.

Thus, caching is done in RAM while databases use disk-based storage because of:

- more space
- non-volatility

### Database Management Systems (DBMS)

Software systems that fundamentally perform these:

- efficiently provide CRUD operations to interact with the DB
- store the data in the DB

Responsibilities:

- **Data Organization** - Efficiently organize data so that CRUD operations are efficient
- **Access** - Methods to perform CRUD operations
- **Data Integrity** - Stored data is accurate, consistent and of appropriate datatype
- **Security** - Protecting data from unauthorized access

**Why not Text Files?** - Storing data in simple text files causes issues with parsing speed, lack of structure/schema, and _concurrency_ (handling multiple users trying to update the same data simultaneously).

### Types of DBs

#### Relational DBs

A relational database is a db which organizes data in tables, rows and columns. Relationships between different tables are defined using concepts like foregin key. It requires a predefined structured schema, and ensures that data is securied

Uses SQL. For eg, MySQL, PostgresSQL.

Use cases - CRMs where data integrity is one of the priorities

#### Non-Relational DBs

Do not enforce a predefined schem. Flexible schema (documents). Good for dynamic, unstructured content.

Use cases - Content Management Systems (CMS) like blogging platform

#### Choosing a DB

Selecting Postgres because:

- Open source software
- Follows SQL standards which allows database migration to other SQL databases
- Extensible - offers a lot of features that a typical SAAS might encounter
- Reliable and scalable
- Very good JSON support

### Postgres Data Types & Best Practices

*   *Integers:*
    *   `Serial` / `BigSerial`: Auto-incrementing integers, usually used for IDs.
    *   `SmallInt`, `Integer`, `BigInt`: Choose based on the size of the number you need to store.
*   *Floats vs. Decimals:*
    *   *Decimal/Numeric:* Stores exact precision. Always use this for cases where accuracy is very important like _money/prices_ to avoid calculation errors.
    *   *Float/Real:* Floating-point numbers. Faster, but can have slight accuracy discrepancies. Use for scientific calculations.
*   *Strings:*
    *   `Char(n)`: Fixed length (pads with spaces). Avoid using this.
    *   `Varchar(n)`: Variable length with a limit. Note: `255` is often just a legacy habit from MySQL.
    *   *`Text`:* Variable length with no limit. *Recommendation:* Prefer `Text` over `Varchar` in Postgres. It is just as performant and avoids future migration headaches if you need to increase string length.
*   *Other Types:*
    *   *`UUID`:* Universally Unique Identifier. Safer and better for distributed systems than integer IDs.
    *   *`JSONB`:* Binary JSON. Always prefer this over standard `JSON` because Postgres can index it and query it faster.
    *   *`Enum`:* A custom type restricted to a specific set of values (e.g., Status: 'Pending', 'Completed'). Great for data integrity and makes the code easily documentable.

### DB Migrations

In a `migrations/` directory, we have sql files containing sql statements. The migration tool goes through these files in a sequential manner and executes all the sql queries on the database.

Two types of migrations:

- **Up Migrations** - which applies changes like adding tables, columns, etc to the database.
- **Down Migrations** - which reverts changes made by up migrations like dropping tables, columns, etc. This process of reverting is called _rollback_.

The migration tool creates a schema which tracks the changes made to the database and ensures that the database is in sync with the codebase.

### Constraints & Integrity
*   *Primary Key:* Implicitly _Unique_ and _Not Null_.
*   *Foreign Key:* Ensures you cannot reference a record that doesn't exist.
*   *Check Constraint:* Enforces custom logic at the database level (e.g., `CHECK priority BETWEEN 1 AND 5`).
*   *Referential Integrity (On Delete):*
    *   `Restrict`: Prevents deleting a User if they still own Projects.
    *   `Cascade`: If a Project is deleted, automatically delete all its Tasks.
* _Unique_: A  

* 


### Data Modeling (Relationships)

- **Naming Conventions**: Use *plural* for table names (eg users) and _snak case_ for columns because Postgres is case-insensitive 
- **One-to-One Relationship**: Exists when two tables are related to each other in such a way that each row in one table can be associated with at most one row in the other table. A good pattern to follow:
    - Split into two tables to keep the main user table lightweight
    - Profile table uses the user's id as both its _primary key_ and _foreign key_

- **One-to-Many Relationship**: Exists when one table is related to many tables. E.g. user can have many posts, so there will be a user_id column in posts table. This is the most common type of relationship.

- **Many-to-Many Relationship**: Exists when two tables are related to each other in such a way that each row in one table can be associated with multiple rows in the other table. E.g. user can have many projects and a project can have many users. Then we need a _junction / linking_ table which will have user_id and project_id as columns. This is the most common type of relationship.

### Example SQL Queries

#### GET

```
sleect u.*, to_jsonb(up.*) as profile
from users u
left join user_profiles up on u.id = up.id
where u.full_name ILIKE :letter || '%'
order by :sortBy :sortOrder
offset :page
limit :limit
```

**Explanation**
This query fetches users whose full name starts with the given letter in a paginated manner. It also joins the user_profiles table with the users table to fetch the profile information of the user.

#### POST

```
insert into users (email, full_name, password_hash)
values (:email, :full_name, :password_hash)
returning *;
```

**Explanation**

This query inserts a new user into the database and returns the created user.

#### PATCH

```
update user_profiles
set bio = :bio, phone = :phone
where user_id = :userId
returning *;
```

**Explanation**

This query updates the bio and phone number of a user and returns the updated user. 


#### Triggers

Everytime a row is inserted, updated or deleted from a table, a trigger can be created to notify the change.

```
create trigger on users
after insert, update, delete
as
begin
	
end
```

#### Indexing

Indexing is a db optimization technique which is used to speed up the data retrieval process. It is a look up table where id of each row is mapped to the its memory location in the disk for a particular column / field. During search, the look up table is travesed to find the id, and then return the data stored at the corresponding location.

Depending on the requirement, we can customize whether the order of index is _asc_ or _desc_.

### Performance and Security

- **Parameterized Queries**: A security and performance technique where the SQL query structure is compiled by the database engine *before* the parameters (user inputs) are supplied and executed.
    *   *How it Works*: Instead of concatenating user input directly into the SQL string (e.g., `SELECT * FROM users WHERE username = '` + input + `'`), you define placeholders (like `?` or `$1`). The database driver sends the query template to the database engine to parse, compile, and create an execution plan first. Then, the parameters are sent separately and bound directly to the placeholders.
    *   *SQL Injection Protection*: By separating the query structure (code) from the user input (data), the database engine treats parameters strictly as literal values. Even if a user attempts to input malicious SQL (e.g., `' OR '1'='1`), it is treated as a literal string rather than executable commands, completely neutralizing SQL Injection (SQLi) attacks.
    *   *Performance Benefits*: Because the query plan is compiled and cached during the preparation phase, subsequent executions of the same query with different parameters can skip the parsing, analysis, and planning steps, resulting in faster execution times.
    *   *Never* concatenate strings to build a query.
    *   Use placeholders (parameters). The database treats the input strictly as a string, preventing malicious code
*   **Indexes**:
    *   Concept: Like a book index, it allows the DB to find a row without scanning every single item (Sequential Scan).
    *   When to Index: Create indexes on columns used in *`WHERE`* clauses, *`JOIN`* conditions, or *`ORDER BY`* sorting.
    *   Trade-off: Indexes speed up Reads but slightly slow down Writes (Insert/Update) because the index must be maintained.
*   **Triggers**:
    *   Used to automate tasks. A common use case is a trigger that automatically updates the `updated_at` timestamp whenever a row is modified, so the application code doesn't have to do it manually.


### API Query Design

*   **Fetching Lists**: Always support *Pagination* (`LIMIT` and `OFFSET`) to avoid fetching too much data at once.

*  **Filtering**: Use `ILIKE` for case-insensitive pattern matching (e.g., searching for a name).

*   **Joins**: Use `LEFT JOIN` if you want to keep records from the main table even if the related table has no data (e.g., get Users even if they don't have a Profile).

---


### Interview Relevant Topics

Types of databases:
- Relational DB - Repositories where data is organized as a set of tables with rows and columns. Interactions between data are organized in the form of relations (links) between these tables. E.g. MySQL, PostgreSQL, SQLite, Oracle, SQL Server.
- Object-Oriented DB - Data is represented as objects wtih a set of attributes and methods. Best suited for applications requiring complex data structures and relationships.
- Distributed DB - Composed of multiple databases that are located on different physical servers.
- NoSQL - Stores and processes unstructured or weakly structured data. E.g. MongoDB, Cassandra, Redis, 

#### Relational DBs
Most popuplar amongst all of them. A special language called SQL (Structured Query Language) is used to interact with relational databases.
- SQL Basics - 
- Merging tables
    - Querying from multiple tables - Querying multiple tables is usually done using joins. 
    - Relationships between tables - Relationships between tables are established using foreign keys. 
- Subquery Expressions - A subquery is a query nested inside another query. Used when you need to use the result of one query as an input for another query
- Indexes - Indexes are used to speed up the data retrieval process. 
- Transactions - Sequences of commands that must be executed completely, or not executed at all. Ensures that data is in a consistent state.
- Object Relational Mapping (ORM)- Execute SQL queries as if were to simply call those methods on an object.


#### ACID Requirements
Atomicity - Guarantess that the transaction will be executed completely or not executed at all.

Consistency - Ensures that each successful transaction leaves the database in a valid state.

Isolation - Ensures that one transaction cannot affect the other in any way.

Durability - Ensures that once a transaction is committed, it will remain in the database even in case of system failure.

<!-- To Do: Add an example of ACID requirements -->
**Example: Bank Transfer** (Alice transfers $100 to Bob)
*   **Atomicity**: Either Alice is debited $100 AND Bob is credited $100, or neither happens (rolls back on failure).
*   **Consistency**: Account balances cannot go negative (enforced by schema constraints). If Alice has < $100, the transaction fails.
*   **Isolation**: Other transactions see either the full pre-transfer or post-transfer state, never intermediate or uncommitted states. (e.g., Prevents a concurrent transaction from approving a purchase using Bob's pending $150 - $50 original + $100 transfer in progress, balance if Alice's transfer fails and rolls back).
*   **Durability**: Once completed, the transfer is written to disk/WAL and persists through power losses or crashes.

#### Designing Databases

Basic steps:

- Define entities - An entity is an object, concept, or thing that we want to store data about. E.g. In an e-commerce application, users, products, orders, 

- Define attributes - These are the properties of an entity. E.g. For a user entity, attributes could be name, email, password, etc.

- Add constraints - Constraints are rules on attribute values to ensure data integrity. E.g. A user's age must be a positive number.

- Define relationships - These are the relationships like one-to-one, one-to-many, many-to-many between entities. E.g. A user can have multiple orders. Relationships between user and order entities can be represented using foreign keys.

- Normalization - Process of seprating data into separate related tables to reduce redundancy and improve data integrity. For e.g., a table with customer and order details can be seprated into two tables, one for customer details and another for order details. This is done to avoid data duplication of columns like customer name, address, etc. in the order table.


- Define indexes - Create indexes on frequently queries columns to speed up the data retrieval process. For e.g., in a table with customer and order details, we can create an index on the customer id column to speed up the process of retrieving orders for a specific customer.

### Redis

A fast data storage working with key-value structures.

Data Types:
```
    String / Bitmap / Bitfield / List / Set / Hash / Sorted sets / Geospatial / Hyperlog / Stream
```



Reference - [Backend Cheat Sheet by yurace](https://github.com/cheatsnake/backend-cheats)