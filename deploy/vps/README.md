# Despliegue de la web en el VPS

Cómo se despliega `atlaxia.es` y qué hay que preparar en el servidor y en GitHub. El canónico es el VPS: `atlaxia.es` no resuelve a GitHub Pages, por eso este repositorio ya no tiene `pages.yml`.

## Cómo funciona

Cada push a `main` (o un lanzamiento manual) ejecuta `.github/workflows/deploy-vps.yml`. El job espera la aprobación del revisor del entorno `vps`, entra por SSH en el VPS con una clave que solo puede lanzar un comando y ese comando, `/usr/local/bin/atlaxia-www-deploy` (copia de [`atlaxia-www-deploy`](atlaxia-www-deploy)), reconstruye la web y recarga Caddy.

Hay cuatro barreras frente al montaje anterior (acción `appleboy/ssh-action` por etiqueta, clave root en secretos de repositorio):

1. **Sin acción de terceros.** El workflow usa el `ssh` del runner. No queda ninguna etiqueta que alguien pueda reasignar, que es lo que pasó con `tj-actions/changed-files` en marzo de 2025.
2. **Clave de host verificada.** El runner solo se conecta si el VPS presenta la clave guardada en `VPS_KNOWN_HOSTS`.
3. **Clave atada a un comando.** La clave pertenece a un usuario sin privilegios, `deploy-www`, y solo puede ejecutar el script de despliegue vía sudo. Robarla permite redesplegar la web, nada más.
4. **Secretos de entorno con revisor.** Los secretos viven en el entorno `vps`, limitado a `main`. Un workflow subido a otra rama no puede leerlos, y cada despliegue espera una aprobación.

La salida del despliegue se queda en el VPS, en `/var/log/atlaxia-www-deploy.log`. Los logs de Actions de este repositorio son públicos y antes mostraban el proyecto compose, los volúmenes, las rutas de Caddy y el usuario root. Ahora el job solo imprime "Despliegue correcto." o "Despliegue fallido (código N)", y falla si el script falla.

## Pasos en el VPS (como root)

Copia `atlaxia-www-deploy` al servidor desde un clon en Linux o con `git show`, no desde una copia de trabajo de Windows: con fin de línea CRLF el script no arranca.

```bash
# 1. Usuario sin privilegios, sin contraseña
useradd --create-home --shell /bin/bash deploy-www
passwd -l deploy-www

# 2. Script de despliegue, propiedad de root y no modificable por deploy-www
install -o root -g root -m 0755 atlaxia-www-deploy /usr/local/bin/atlaxia-www-deploy

# 3. Sudo solo para ese script, sin argumentos
echo 'deploy-www ALL=(root) NOPASSWD: /usr/local/bin/atlaxia-www-deploy ""' > /etc/sudoers.d/deploy-www
chmod 0440 /etc/sudoers.d/deploy-www
visudo -cf /etc/sudoers.d/deploy-www

# 4. Log local del despliegue, con rotación
touch /var/log/atlaxia-www-deploy.log
chmod 0640 /var/log/atlaxia-www-deploy.log
cat > /etc/logrotate.d/atlaxia-www-deploy <<'EOF'
/var/log/atlaxia-www-deploy.log {
    weekly
    rotate 8
    compress
    missingok
    notifempty
}
EOF
```

Genera un par de claves nuevo **en tu equipo**, no reutilices el actual:

```bash
ssh-keygen -t ed25519 -N '' -C 'github-actions-atlaxia-www' -f atlaxia-www-deploy-key
```

En el VPS, añade la pública con el comando forzado:

```bash
install -d -o deploy-www -g deploy-www -m 0700 /home/deploy-www/.ssh
echo 'restrict,command="sudo -n /usr/local/bin/atlaxia-www-deploy" ssh-ed25519 AAAA...pública... github-actions-atlaxia-www' \
  > /home/deploy-www/.ssh/authorized_keys
chown deploy-www:deploy-www /home/deploy-www/.ssh/authorized_keys
chmod 0600 /home/deploy-www/.ssh/authorized_keys
```

Si `AllowUsers` o `AllowGroups` aparecen en `/etc/ssh/sshd_config`, añade `deploy-www` y recarga sshd.

Prueba el script a mano antes de tocar GitHub: `sudo -u deploy-www sudo -n /usr/local/bin/atlaxia-www-deploy` debe imprimir "Despliegue correcto." y dejar el detalle en el log.

## Pasos en GitHub (Settings)

1. **Environments > New environment `vps`.** En "Deployment branches and tags", solo `main`. En "Required reviewers", al menos una persona (Jorge, David o los dos).
2. **Secretos del entorno `vps`:**
   - `VPS_HOST`: el mismo de ahora.
   - `VPS_USER`: `deploy-www`.
   - `VPS_SSH_KEY`: el contenido de `atlaxia-www-deploy-key` (la privada).
   - `VPS_KNOWN_HOSTS`: la salida de `ssh-keyscan -t ed25519 <host>`. **Compárala** antes con la huella que da el propio VPS (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`). Si no coinciden, para.
3. **Advanced Security:** activa Dependabot alerts, Dependabot security updates, secret scanning y push protection. Son gratuitos en un repositorio público.

## Después de la primera ejecución correcta

- **Quita la clave antigua de `/root/.ssh/authorized_keys`.** Sin este paso, la mejora no sirve: la clave vieja sigue dando root.
- **Borra los secretos de repositorio** `VPS_SSH_KEY`, `VPS_USER` y `VPS_HOST` (Settings > Secrets and variables > Actions > Repository secrets). Mientras existan, cualquier workflow de cualquier rama puede leer la clave root.
- **Desactiva GitHub Pages** (Settings > Pages) y, si quieres, borra el entorno `github-pages`.

## Paso siguiente: construir en el runner y enviar solo `out/`

Hoy el servicio `atlaxia-www-build` clona el repositorio público y ejecuta `npm` y `next build` en el propio VPS. Un paquete npm comprometido, el patrón de Shai-Hulud con scripts de postinstall, correría en producción. Además clona el `main` del momento y no `github.sha`, aunque `concurrency` evita que dos despliegues se solapen.

La web es un export estático, así que el VPS no necesita ni Node ni el código fuente. El diseño propuesto, para una segunda migración separada de esta:

1. **En Actions, job `build`** sin secretos y con `permissions: contents: read`: `actions/checkout` fijado por SHA con `persist-credentials: false`, `actions/setup-node` con `node-version-file: .nvmrc`, `npm ci`, `npm run check` y subida de `out/` como artefacto.
2. **Job `deploy`** con `environment: vps` y `needs: build`: descarga el artefacto y lo envía con `rsync` por SSH. Este job no ejecuta código de npm, así que la clave nunca convive con dependencias de terceros.
3. **En el VPS**, la clave queda atada a `rrsync` (incluido en el paquete `rsync`) en modo solo escritura sobre un directorio de versiones, por ejemplo `restrict,command="rrsync -wo /srv/atlaxia-www/incoming"`. Un script fijo, lanzado por el mismo mecanismo de comando forzado, mueve la versión nueva al directorio que sirve Caddy y recarga.
4. Cuando funcione, se retiran el servicio `atlaxia-www-build` y su clonado del repositorio.

Pendiente de comprobar en el VPS antes de diseñarlo en detalle: qué directorio o volumen sirve Caddy (el log de un despliegue antiguo menciona el volumen `local-ai-packaged_atlaxia_www`) y si el contenedor de build monta algo sensible del host.

Mientras tanto, `npm ci --ignore-scripts` en el contenedor de build reduce el riesgo. La build de Next de este repositorio no necesita ningún script de instalación propio; solo `esbuild`, `fsevents` y `unrs-resolver` declaran scripts, y conviene probarlo antes en una copia.

## Otras decisiones abiertas

- **Ruleset en `main`:** exigir PR con una aprobación y prohibir force-push y borrado. Exigir además `npm run check` como estado requerido necesita un workflow de CI que lo ejecute en cada PR, y hoy no existe (el job `build` del paso siguiente lo cubriría).
- **`PermitRootLogin no`:** solo después de comprobar que hay otro acceso administrativo al VPS. No lo cambies a ciegas o puedes quedarte fuera.
