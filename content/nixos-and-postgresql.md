---
title: NixOS and PostgreSQL
description: Migrating from PostgreSQL 14 to 15
date: 27/11/2023
tags: 
    - nixos
    - postgresql
---

When upgrading to version 15 from 14, there was an issue. None of my data was
transferred. To fix this issue I swapped to the `posgres` user who is a
superuser on the PostgreSQL databases.

Then to preform the migration I ran:

```sql
-- to do this without swapping user you can use the flag -U
pg_dumpall > sqldump
```

then when I had the sqldump file, the following command was run from the command
line to get use the sqldump file to recover the previous data

```bash
psql -f sqldump
```
