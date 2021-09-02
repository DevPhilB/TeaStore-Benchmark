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
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>

double calculateMean(double data[], int requestsSucceeded) {
    double mean = 0.0;
    double sum = 0.0;
    for (int i = 0; i < requestsSucceeded; i++) {
        sum += data[i];
    }
    mean = sum / requestsSucceeded;
    return mean;
}

double calculateStandardDeviation(double data[], int requestsSucceeded, double mean) {
    double standardDeviation = 0.0;
    for (int i = 0; i < requestsSucceeded; i++) {
        standardDeviation += pow(data[i] - mean, 2);
    }
    return sqrt(standardDeviation / requestsSucceeded);
}

// To disable response printing
size_t write_data(void *buffer, size_t size, size_t nmemb, void *userp) {
   return size * nmemb;
}

int main(void) {
  CURL *curl;
  CURLcode response;
  long version = 2l; // 2, 3, 30
  int requests = 10000;
  int clients = 1;

  // Statistics
  double completeTime = 0.0;
  double totalBytesPerSecond = 0.0;
  double bandwidth = 0.0;
  int requestsSucceeded = 0;
  int requestsFailed = 0;
  // Min
  double timeForRequestsMin = 99999999.99;
  double timeForConnectMin = 99999999.99;
  double timeToFirstByteMin = 99999999.99;
  double requestsPerSecondMin = 99999999.99;
  // Max
  double timeForRequestsMax = 0.0;
  double timeForConnectMax = 0.0;
  double timeToFirstByteMax = 0.0;
  double requestsPerSecondMax = 0.0;
  // Mean
  double timeForRequestsMean = 0.0;
  double timeForConnectMean = 0.0;
  double timeToFirstByteMean = 0.0;
  double requestsPerSecondMean = 0.0;
  // Standard deviation
  double timeForRequestsStandardDeviation = 0.0;
  double timeForConnectStandardDeviation = 0.0;
  double timeToFirstByteStandardDeviation = 0.0;
  double requestsPerSecondStandardDeviation = 0.0;

  FILE* stream = fopen("workload-0.csv", "r"); // Can only handle one thread

  char line[requests];
 
  curl = curl_easy_init();
  if (curl) {
    // Disable response printing
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_data);
    // Switch between HTTP Versions
    curl_easy_setopt(curl, CURLOPT_HTTP_VERSION, version);

    int index = 0;
    // Data
    double bytesPerSecond[requests];
    double totalTime[requests];
    double connectTime[requests];
    double timeToFirstByte[requests];
    double requestsPerSecond[clients]; // For multiple clients

    // TODO:
    // (Re-)Use cookies/headers
    // Add HTTP/2 and HTTP/3 option
    // Use command line arguments for number of request and HTTP version
    // Multiple clients

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
  
        // Perform the request, res will get the return code
        response = curl_easy_perform(curl);
        // Check for errors
        if(response != CURLE_OK) {
          requestsFailed++;
          fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(response));
        } else {
          requestsSucceeded++;
          // Get data
          curl_easy_getinfo(curl, CURLINFO_SPEED_DOWNLOAD_T, &bytesPerSecond[index]);
          curl_easy_getinfo(curl, CURLINFO_TOTAL_TIME, &totalTime[index]);
          curl_easy_getinfo(curl, CURLINFO_CONNECT_TIME, &connectTime[index]);
          curl_easy_getinfo(curl, CURLINFO_STARTTRANSFER_TIME, &timeToFirstByte[index]);
        }

        free(lineCopy);
        index++;
    }

    // Calculate results
    for (index = 0; index < requestsSucceeded; index++) {
      double timeForRequest = totalTime[index];
      double timeToConnect = connectTime[index];
      double timeToFirstB = timeToFirstByte[index];

      completeTime += timeForRequest;
      totalBytesPerSecond += bytesPerSecond[index];
      // Min
      timeForRequestsMin = timeForRequest < timeForRequestsMin ? timeForRequest : timeForRequestsMin;
      timeForConnectMin = timeToConnect < timeForConnectMin ? timeToConnect : timeForConnectMin;
      timeToFirstByteMin = timeToFirstB < timeToFirstByteMin ? timeToFirstB : timeToFirstByteMin;
      // Max
      timeForRequestsMax = timeForRequest > timeForRequestsMax ? timeForRequest : timeForRequestsMax;
      timeForConnectMax = timeToConnect > timeForConnectMax ? timeToConnect : timeForConnectMax;
      timeToFirstByteMax = timeToFirstB > timeToFirstByteMax ? timeToFirstB : timeToFirstByteMax;
    }
    // TODO: Handle multiple clients/threads
    requestsPerSecond[0] = requestsSucceeded / completeTime; // Only for single client
    //
    bandwidth = (totalBytesPerSecond / requestsSucceeded) / 1000000;
    // Min & max for requests per second for multiple clients
    for (index = 0; index < clients; index++) {
      double clientRequestsPerSecond = totalTime[index];
      // Min
      requestsPerSecondMin = clientRequestsPerSecond < requestsPerSecondMin ? clientRequestsPerSecond : requestsPerSecondMin;
      // Max
      requestsPerSecondMax = clientRequestsPerSecond > requestsPerSecondMax ? clientRequestsPerSecond : requestsPerSecondMax;
    }

    // Calculate mean and standard deviation
    timeForRequestsMean = calculateMean(totalTime, requestsSucceeded);
    timeForConnectMean = calculateMean(connectTime, requestsSucceeded);
    timeToFirstByteMean = calculateMean(timeToFirstByte, requestsSucceeded);
    requestsPerSecondMean = calculateMean(requestsPerSecond, clients);
    timeForRequestsStandardDeviation = calculateStandardDeviation(totalTime, requestsSucceeded, timeForRequestsMean);
    timeForConnectStandardDeviation = calculateStandardDeviation(connectTime, requestsSucceeded, timeForConnectMean);
    timeToFirstByteStandardDeviation = calculateStandardDeviation(timeToFirstByte, requestsSucceeded, timeToFirstByteMean);
    requestsPerSecondStandardDeviation = calculateStandardDeviation(requestsPerSecond, clients, requestsPerSecondMean);
    
    // Print results
    fprintf(stdout, "Finished in %.2f %s %.2f %s %.2f %s\n",
      completeTime, "s, ", requestsPerSecond[0], "req/s, ", bandwidth, "MB/s");

    fprintf(stdout, "Requests: %i %s %i %s %i %s\n",
      requests, "total, ", requestsSucceeded, "succeeded, ", requestsFailed, "failed");

    fprintf(stdout, "\t\t\t min \t\t max \t\t mean \t\t sd\n");
    // Time for request
    fprintf(stdout, "time for request: \t %.2f %s \t %.2f %s \t %.2f %s \t %.2f %s\n",
      timeForRequestsMin * 1000, "ms", timeForRequestsMax * 1000, "ms",
      timeForRequestsMean * 1000, "ms", timeForRequestsStandardDeviation * 1000, "ms");
    // Time for connect
    fprintf(stdout, "time for connect: \t %.2f %s \t %.2f %s \t %.2f %s \t %.2f %s\n",
      timeForConnectMin * 1000, "ms", timeForConnectMax * 1000, "ms",
      timeForConnectMean * 1000, "ms", timeForConnectStandardDeviation * 1000, "ms");
    // Time to first byte
    fprintf(stdout, "time for first byte: \t %.2f %s \t %.2f %s \t %.2f %s \t %.2f %s\n",
      timeToFirstByteMin * 1000, "ms", timeToFirstByteMax * 1000, "ms",
      timeToFirstByteMean * 1000, "ms", timeToFirstByteStandardDeviation * 1000, "ms");
    // Requests per second (of all clients/threads)
    fprintf(stdout, "Req/s (client): \t %.2f \t \t %.2f \t \t %.2f \t %.2f\n",
      requestsPerSecondMin, requestsPerSecondMax, requestsPerSecondMean, requestsPerSecondStandardDeviation);

    // Always cleanup
    curl_easy_cleanup(curl);
  }
  return 0;
}
