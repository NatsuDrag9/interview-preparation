## Serialization and Deserialization

Converting message data to/from a common format during transmission or storage.

For HTTP communication, **Javascript Object Notation (JSON)** is the most popuplar serialization mechanism

```
{
    "key": value,
}

//
value is | number | object | array | boolean
```

Other text based standards are (not used in HTTP though):

1. YAML
2. XML

Binary serialization - protobuf
