/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>

int main(void) {
  CURL *curl;
  CURLcode response;
  long version = 2l; // 2, 3, 30
  int requests = 900;

  FILE* stream = fopen("fake.csv", "r");

  char line[requests];
 
  curl = curl_easy_init();
  if(curl) {
    // Switch between HTTP Versions
    curl_easy_setopt(curl, CURLOPT_HTTP_VERSION, version);

    while (fgets(line, requests, stream)) {
        char* lineCopy = strdup(line);
        char* method = strtok(lineCopy, ";");
        char* url = strtok(NULL, ";");
        char* body = strtok(NULL, ";");
        //
        curl_easy_setopt(curl, CURLOPT_URL, url);
        // For post requests
        if (!body && strstr(url, "logioaction") != NULL) {
          curl_easy_setopt(curl, CURLOPT_POST, 1L);
        } else if (body) {
          curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, strlen(body));
          curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);
        }
  
        /* Perform the request, res will get the return code */
        response = curl_easy_perform(curl);
        /* Check for errors */
        if(response != CURLE_OK) {
          fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(response));
        } else {
          fprintf(stdout, "curl_easy_perform() was successful!");
        }

        free(lineCopy);
    }

    /* Always cleanup */
    curl_easy_cleanup(curl);
  }
  return 0;
}
