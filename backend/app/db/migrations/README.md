# FILES

``script.py.mako:``
will instruct alembic on how to generate new migration scripts

``env.py:``
This file is run whenever the alembic migration tool is invoked and runs the appropiate migration

# SETUP MIGRATIONS

1. Edit alembic.ini with appropiate [alembic] settings
2. Execute `alembic revision -m "first revision message"`
3. Edit the created migration file (folder specified in alembic.ini) functions to upgrade and downgrade

# RUN MIGRATIONS

1. Execute `alembic upgrade head` to run all migrations

## EXPORT MIGRATIONS AS PLAIN SQL

Backup first with ``bin/db``, then inside the container run:

```bash
alembic downgrade <current_revision>:base --sql 
alembic upgrade head --sql
```

**NOTE**: to export the whole schema, e.g. migrating from alembic to plain sql, export with ``pg_dumpall`` and remove alembic references. DBeaver can also be used.

# Backup and restore data considering schema changes

## (not recommended) Inplace editing of a revision .py file

Make sure to dump data only with ``pg_dump``, not the schema.

- Restoring with a brand new table added to the schema?

 1. Downgrade to base before editing it, else the downgrade function will fail to find an unexisting table

 2. Update the migration script accordingly
 3. Upgrade to head to apply changes
 4. Restore the data from the dump. If by mistake the dump contains the schema as well, it will fail to restore.

- Restoring with column/table name changes to the schema?
   1. Most likely requires a manual update of the dump file to reflect changes

## Generating a new revision .py file

1. Create a new revision.

    ```bash
    alembic revision -m "create user_skills"
    ```

2. Edit the created migration file to upgrade and downgrade
3. Run `alembic upgrade head` to apply the changes!

**NOTES:** (Only valid for multiple revision setup)
_Want to ditch the latest revision and restore a backup made with an old revision?_
Simply downgrade the revision to the desired id and restore.
If columns/tables were renamed, a manual update to the dump is needed.
Any other errors will be shown as well, e.g. if the old revision doesn't contain a table, it won't restore that table:

```bash
ERROR:  relation "public.user_skills_id_seq" does not exist
```

...however, the rest of the data will be restored normally.

## Making changes while in development

- Imagine we want to change the primary key of a table to be an incremental integer instead of `some_column`. Simply backup, edit the migration script wherever the table is defined and add a new ``sa.Column("id", sa.Integer, primary_key=True)``, removing ``primary_key=True`` from `some_column`.
Restore the database and new ids will be assigned. No need for a new revision.
