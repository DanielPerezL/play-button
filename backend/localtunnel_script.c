#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ENV_FILE "/home/dani/play-button/backend/.env"
#define VARIABLE "LOCALTUNNEL_URL"

// Función para ejecutar Serveo y actualizar el archivo .env
void ejecutar_serveo(int puerto) {
    // Comando para ejecutar Serveo
    char comando[256];
    snprintf(comando, sizeof(comando), "ssh -R 80:localhost:%d serveo.net", puerto);

    // Redirigir salida de Serveo a un archivo temporal
    FILE *fp = popen(comando, "r");
    if (fp == NULL) {
        perror("Error al ejecutar Serveo");
        exit(1);
    }

    // Buscar la URL en la salida de Serveo
    char url[256];
    while (fgets(url, sizeof(url), fp) != NULL) {
        if (strstr(url, "https://") != NULL) {
            // Extraer solo la URL, eliminando cualquier texto extra
            char *url_start = strstr(url, "https://");
            if (url_start != NULL) {
                // Eliminar el salto de línea y otros caracteres que puedan aparecer
                url_start[strcspn(url_start, "\n")] = '\0';  // Eliminar el '\n'

                printf("URL de Serveo: %s\n", url_start);

                // Abrir el archivo .env para modificarlo
                FILE *env_file = fopen(ENV_FILE, "a");
                if (env_file == NULL) {
                    perror("Error al abrir el archivo .env");
                    exit(1);
                }

                // Eliminar cualquier línea con la variable anterior
                FILE *env_temp = fopen("/tmp/.env_temp", "w");
                if (env_temp == NULL) {
                    perror("Error al abrir el archivo temporal");
                    exit(1);
                }

                // Leer el archivo .env original y escribir las líneas sin la variable
                FILE *env_original = fopen(ENV_FILE, "r");
                if (env_original == NULL) {
                    perror("Error al leer el archivo .env");
                    exit(1);
                }

                char line[256];
                while (fgets(line, sizeof(line), env_original)) {
                    if (strstr(line, VARIABLE) == NULL) {
                        fputs(line, env_temp);
                    }
                }

                // Añadir la nueva URL al final
                fprintf(env_temp, "%s=%s\n", VARIABLE, url_start);

                fclose(env_original);
                fclose(env_temp);

                // Reemplazar el archivo original .env con el archivo temporal
                rename("/tmp/.env_temp", ENV_FILE);

                fclose(env_file);
                break;  // Detener el ciclo después de encontrar la URL
            }
        }
    }

    fclose(fp);
}

int main() {
    // Llamar a la función para ejecutar Serveo en el puerto 5000
    ejecutar_serveo(5000);

    return 0;
}
