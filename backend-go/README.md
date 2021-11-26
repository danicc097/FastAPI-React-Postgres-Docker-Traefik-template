# Backend-go

Routes:
- TDD mux : https://github.com/TomFern/go-mux-api


## DDD in Go



Entity: use if it is a reusable object, independently stored in the database, can change and apply on many other objects, or coupled to some external Entity which forces it to update itself when the Entity changes. Equality between Entities exists when an identifier field is equal.

### Value objects

Use when describes some value, belongs to a particular Entity, it is a simple copy from an external service, or it should not exist independently in the database. Equality between value objects exists when all fields are equal.

Value object fields are to be immutable, the correct way to "update" them is to create a new value object instance. In Go, we can make sure to follow this rule simply by using values as arguments to our value object methods instead of pointer references.
This immutability means that we should not and there is no need to validate Value Object during its whole lifetime, only upon creation:

```go
// wrong way
func (m *Money) Deduct(other Money) {
  m.Amount -= other.Amount
}

// right way
func (m Money) Deduct(other Money) Money {

  // validation functions...

  return Money {
    Amount:   m.Amount - other.Amount,
    Currency: m.Currency,
  }
}
```

## Entities

It is not necessary that entities reflect the database schema. They should contain the essential business logic required for the given entity.
Objects that do mirror the database schema are "Data Transfer Objects" (DTOs).
