## Validations and Transformations

After route layer which matches the API request, validations and transformations are performed before the request is handled by the controller layer.

This layer ensures that various types of data sent from the client (like query parameters, path parameters, json payload) is in the expected format before further interactions with the controller and service layers.

Essentially, this is a reusable utility function contiaining specifics. If validation fails, the client is notified with an appropriate error response, otherwise the request is allowed to proceed to the controller and service layers.

### Types of Validations
Validations check whether the user data satisfies a specific set of rules.

#### Syntax Level Validation

Checks if the provided input satisfies the syntactical constraints like:
- email format where `<string>@<string>.<string>`
- phone number (with country code followed by number of digits)
- dates 
- Etc.

#### Semantic Level Validation

Logic validations checks if the provided input is correct and meaningful. For eg:
- DOB cannot be in future
- quantity cannot be negative
- Password should be at least 8 characters long
- and so on

#### Type Level Validation

Checks if the data type of input matches the expected data type or not:
- age - number
- name - string
- is_active - boolean
- and so on


### Transformations

Execute some operations on the input data  depending on the success/failure of the validation step or any other default requirements for server's convenience.

For eg, in the following api:

`/bookmarks?page=2&limit=20`, 
the `page` and `limit` are sent as strings from the client.

But server has the following requirements:
```
page: 0 < page < 500
limit: 0 < limit < 10000
```

Transformation layer converts them into integers from strings and then validates the bounds.
This process of conversion is called _transformation_.

### Frontend and Backend Validations

Fronted validation is for user experience and user convenience.

Server side (backend) validation is for security and data integrity.