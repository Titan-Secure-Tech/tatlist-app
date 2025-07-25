---
description: Connecting to local Supabase postgres db instance in developmen
globs: 
alwaysApply: false
---

# Supabase local development guidelines

- if you need to debug or troubleshoot a Supabase issue, use the running Docker container directly.

Example:

```bash
docker ps
```

```bash
docker exec -i f3f75186590e psql -U postgres -c "SELECT id, content, title FROM public.documents ORDER BY id DESC LIMIT 1;" 
```
```bash
docker exec -i f3f75186590e psql -U postgres -c "SELECT content FROM public.documents WHERE id = 3;" | cat
```