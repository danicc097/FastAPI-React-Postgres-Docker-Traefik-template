# Introduction

The purpose of a repository is to serve as a layer of abstraction on top of database actions.
Each repository encapsulates database functionality corresponding to a particular resource.
For this app, repositories are treated as a stand-in for a more traditional ORM.

Pydantic parses and validates our inputs, fills in default values, and can convert the model into a dictionary,
which can be passed as arg to other models, to our database query parameters, etc.

```python
new_cleaning = CleaningCreate(name="Clean My House", cleaning_type="full_clean", price="29.99")
query_values = new_cleaning.dict()
print(query_values)
# {"name": "Clean My House", "cleaning_type": "full_clean", "price": 29.99, "description": None}
```

The ``databases`` package allows for ``:query_arg`` style query parameters (which can come from unpacked dicts from a model).
A query (with ``fetch_one``, ``fetch_all``, etc) returns a ``Record`` whose keys can be unpacked to yet another Pydantic model for further validation.


# Transactions

When executing multiple queries, i.e. multiple ``fetch_all``, ``fetch_one``, etc. we can use the following context manager:
```python
async with self.db.transaction():
```

# Interesting docs

- https://www.encode.io/databases/
