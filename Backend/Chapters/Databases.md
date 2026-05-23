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
