-- Knit · v1 · arreglo de sync de note_tags
-- El cliente usa como id local una clave compuesta `${note_id}:${tag_id}`
-- (ver src/lib/db.ts y src/lib/tags.ts), pero esta columna se creó como uuid,
-- así que el upsert fallaba con 22P02 "invalid input syntax for type uuid".
-- La identidad real la garantiza `unique (user_id, note_id, tag_id)`; `id`
-- se conserva solo para mantener el upsert uniforme por id.
-- El cambio es aditivo: no borra filas ni toca otras tablas.

alter table note_tags alter column id type text;
