# PlayButton API REST Documentation

Esta es la documentación de la API REST para interactuar con el backend de PlayButton. La API proporciona varios endpoints para la autenticación de usuarios, manejo de playlists, canciones y sugerencias. Además, todos los endpoints requieren tokens JWT que se gestionan mediante cookies.

## Autenticación

### 1. Login

**POST** `/api/auth/login`

Este endpoint permite a los usuarios autenticarse utilizando un nombre de usuario (nickname) y contraseña.

#### Parámetros de entrada:

- `nickname`: Nombre de usuario.
- `password`: Contraseña del usuario.

#### Respuesta:

- **200 OK**: Devuelve el token `access_token`, el id del usuario logueado `user_id` y un booleano indicando si eres o no administrador `is_admin`.
- **400 Bad Request**: Si faltan los campos `nickname` o `password` en la solicitud.

### 2. Logout

**POST** `/api/auth/logout`

Este endpoint permite a los usuarios cerrar sesión. Borra los tokens de acceso y actualización de las cookies.

#### Respuesta:

- **204 No Content**: Cierre de sesión exitoso.


## Playlists

### 3. Obtener todas las Playlists

**GET** `/api/playlists`

Este endpoint permite obtener todas las playlists públicas del sistema en un listado páginado.

#### Parámetros de entrada:

- `offset`: Desplazamiento para la paginación.
- `limit`: Límite de elementos por página.

#### Respuesta:

- **200 OK**: Lista de playlists.

### 4. Eliminar una Playlist

**DELETE** `/api/playlists/{playlist_id}`

Este endpoint elimina una playlist especificada por su `playlist_id`.

#### Parámetros de entrada:

- `playlist_id`: ID de la playlist a eliminar.

#### Respuesta:

- **204 No Content**: Playlist eliminada exitosamente.
- **401 Unauthorized**: Si el usuario no tiene permisos para eliminar la playlist.

### 5. Actualizar una Playlist

**PUT** `/api/playlists/{playlist_id}`

Este endpoint permite actualizar el nombre y la visibilidad (pública/privada) de una playlist.

#### Parámetros de entrada:

- `playlist_id`: ID de la playlist a actualizar.
- `name`: Nuevo nombre de la playlist.
- `is_public`: Nueva visibilidad de la playlist (booleano).

#### Respuesta:

- **200 OK**: Playlist actualizada exitosamente.
- **400 Bad Request**: Si faltan campos `name` o `is_public`.

### 6. Añadir Canción a Playlist

**POST** `/api/playlists/{playlist_id}/songs/{song_id}`

Este endpoint permite añadir una canción a una playlist.

#### Parámetros de entrada:

- `playlist_id`: ID de la playlist.
- `song_id`: ID de la canción a añadir.

#### Respuesta:

- **201 Created**: Canción añadida exitosamente.
- **401 Unauthorized**: Si el usuario no tiene permisos para modificar la playlist.

### 7. Eliminar Canción de Playlist

**DELETE** `/api/playlists/{playlist_id}/songs/{song_id}`

Este endpoint permite eliminar una canción de una playlist.

#### Parámetros de entrada:

- `playlist_id`: ID de la playlist.
- `song_id`: ID de la canción a eliminar.

#### Respuesta:

- **204 No Content**: Canción eliminada exitosamente.
- **401 Unauthorized**: Si el usuario no tiene permisos para modificar la playlist.

### 8. Obtener Canciones de una Playlist

**GET** `/api/playlists/{playlist_id}/songs`

Este endpoint permite obtener todas las canciones de una playlist.

#### Parámetros de entrada:

- `playlist_id`: ID de la playlist.

#### Respuesta:

- **200 OK**: Lista de canciones de la playlist.
- **401 Unauthorized**: Si la playlist no es pública y el usuario no tiene permisos para acceder a ella.

## Canciones

### 9. Crear Canción

**POST** `/api/songs`

Este endpoint permite a un administrador crear una nueva canción subiendo un archivo MP3.

#### Parámetros de entrada:

- `mp3`: Archivo MP3 de la canción.
- `name`: Nombre de la canción.

#### Respuesta:

- **201 Created**: Canción creada exitosamente con la URL de la canción en el encabezado `Location`.
- **400 Bad Request**: Si faltan los parámetros `mp3` o `name`.
- **401 Unauthorized**: Si el usuario no puede gestionar las canciones del sistema.

### 19. Obtener Canciones

**GET** `/api/songs`

Este endpoint permite obtener las canciones del sistema en un listado páginado.

#### Parámetros de entrada:

- `offset`: Desplazamiento para la paginación.
- `limit`: Límite de elementos por página.
- `name`: Nombre para buscar canciones.

#### Respuesta:

- **200 OK**: Listado de canciones.

### 11. Obtener Canción por ID

**GET** `/api/songs/{song_id}`

Este endpoint permite obtener los detalles de una canción utilizando su `song_id`.

#### Parámetros de entrada:

- `song_id`: ID de la canción.

#### Respuesta:

- **200 OK**: Detalles de la canción.

### 12. Eliminar Canción

**DELETE** `/api/songs/{song_id}`

Este endpoint permite eliminar una canción especificada por su `song_id`.

#### Parámetros de entrada:

- `song_id`: ID de la canción a eliminar.

#### Respuesta:

- **204 No Content**: Canción eliminada exitosamente.
- **401 Unauthorized**: Si el usuario no puede gestionar las canciones del sistema.

### 13. Recuperar archivo MP3

**GET** `/uploads/mp3_files/{filename}`

Este endpoint permite descargar un archivo MP3 utilizando su nombre de archivo. Este ruta se encuentra en los detalles de la canción, no hay que construirla en el front. Además, se sirve a través de serveo para no consumir el ancho de banda de ngrok.

#### Parámetros de entrada:

- `filename`: Nombre del archivo MP3.

#### Respuesta:

- **200 OK**: El archivo MP3 solicitado.

## Usuarios

### 14. Registrar Usuario

**POST** `/api/users`

Este endpoint permite registrar un nuevo usuario. Requiere privilegios de administrador.

#### Parámetros de entrada:

- `nickname`: Nombre de usuario.
- `password`: Contraseña del usuario.

#### Respuesta:

- **201 Created**: Usuario creado exitosamente.
- **403 Forbidden**: Si el usuario no tiene privilegios de administrador.

### 15. Obtener Información de Usuario

**GET** `/api/users/{user_id}`

Este endpoint permite obtener la información de un usuario especificado por su `user_id`.

#### Parámetros de entrada:

- `user_id`: ID del usuario.

#### Respuesta:

- **200 OK**: Información del usuario.

### 16. Actualizar Contraseña de Usuario

**PATCH** `/api/users/{user_id}`

Este endpoint permite a un usuario actualizar su contraseña.

#### Parámetros de entrada:

- `current_password`: Contraseña actual del usuario.
- `new_password`: Nueva contraseña.

#### Respuesta:

- **204 No Content**: Contraseña actualizada exitosamente.
- **400 Bad Request**: Si faltan los parámetros `current_password` o `new_password`.
- **401 Unauthorized**: Si el cliente no tiene permisos sobre el usuario que quiere actualizar.

### 17. Eliminar Cuenta de Usuario

**DELETE** `/api/users/{user_id}`

Este endpoint permite eliminar la cuenta de un usuario.

#### Parámetros de entrada:

- `user_id`: ID del usuario a eliminar.

#### Respuesta:

- **204 No Content**: Cuenta eliminada exitosamente.
- **401 Unauthorized**: Si el cliente no tiene permisos sobre el usuario que quiere actualizar.

## Sugerencias

### 18. Crear Sugerencia

**POST** `/api/suggestions`

Este endpoint permite a los usuarios crear una sugerencia de canción.

#### Parámetros de entrada:

- `song_name`: Nombre de la canción sugerida.

#### Respuesta:

- **201 Created**: Sugerencia creada exitosamente.
- **400 Bad Request**: Si falta el campo `song_name`.

---

## Notas importantes:

1. Todos los endpoints que requieren autenticación usan JWT almacenados en las cookies del navegador.
2. Para interactuar con la API, asegúrese de enviar las cookies de autenticación en cada solicitud.
3. Los endpoints que modifican recursos (como `POST`, `PUT`, `DELETE`) requieren que el usuario esté autenticado y tenga permisos adecuados.

