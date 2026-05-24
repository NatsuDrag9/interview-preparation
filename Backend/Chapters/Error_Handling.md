## Error Handling

Errors are a part of any application and can occur due to various reasons. Handling them is a mindset.

### Types of Errors

- **Logic Error**: Errors that are caused by flaws in the application's logic. Occurs due to misunderstanding of business logic and requirements. 

- **Database Errors**: Can bring the entire system down.
    - Connection errors - Cannot connect to database
    - Query errors - SQL syntax errors, Invalid queries
    - Constraint errors - Arise due to constraints like unique constraint, foreign key constraint, etc. UniqueConstraintError, ForeignKeyConstraintError, etc.

-  **External Service Errors** - Payment gateway errors, email service errors, etc. 

- **Input Validation Errors** - Errors that occur due to invalid input from the user. For example - invalid email format, invalid phone number, etc. Arise during validation and transformation phase.

- **Configuration Errors** - Errors that occur due to misconfiguration of the application when moving between different environments - development, staging, production. For example - invalid database credentials, invalid email credentials, etc. Arise during startup.

### Handling Errors and Preventing Them

- Finding errors before errors happen
- Health and Status check errors -  
- Contianment and Gracefull degradation
- Error Recovery Strategies
- Error Propagation Control - Bubble up errors to relevant service layer
- Global Error Handler - It reduces redundancy of creating error handling in every layer by handling all the errors in one place.

### Security

Error messages and logs are prime targets for malicious users. You must strictly control what data leaves your backend.
*   **Never Leak Internal Details**: If a database query fails, never send the raw database error back to the user. It can expose table names, index names, and constraint logic, which attackers use to craft SQL injection attacks. Always intercept these and return a generic "Something went wrong" (`500`) message.
*   **Prevent Enumeration Attacks**: In authentication (login) endpoints, if a user inputs the wrong email, never return "Email does not exist." If you do, attackers will automate scripts to figure out which emails belong to real accounts. Always use a generic message like **"Invalid username or password"**.
*   **Sanitize Your Logs**: When logging errors for debugging, never log sensitive user data like plain-text passwords, API keys, credit card numbers, or even emails. Always use non-sensitive identifiers like User IDs and Correlation IDs.

