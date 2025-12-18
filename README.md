# Landing Page — Envío de formulario por correo

El formulario **“Enviar y pedir demo”** envía un correo a `eduardo.caicedom@gmail.com` usando **FormSubmit** (sin backend propio).

## Cómo funciona

- El formulario hace un `POST` a `https://formsubmit.co/ajax/eduardo.caicedom@gmail.com` desde `app.js`.
- Si el envío por AJAX falla, hace fallback a envío normal del formulario (`action="https://formsubmit.co/..."`).
- Incluye honeypot `_honey` para reducir spam.

## Importante (primera vez)

FormSubmit suele pedir **confirmación del correo destino** la primera vez que se usa. Revisa tu bandeja de entrada y aprueba el envío.

## Probar local

En la carpeta del proyecto:

```bash
python3 -m http.server 5173
```

Abre `http://localhost:5173` y envía el formulario.

