# TeaStore v2 Benchmark
CSV generator (JavaScript) to generate workloads for n-Threads.  
Lua script to use CSV workloads.  
Custom benchmark tool using [libcurl](https://curl.se/libcurl) (development stopped).  
Designed for [TeaStore v2](https://github.com/DevPhilB/TeaStore).

## Setup (for wrk-2)
### Get and build wrk-2
Change `/.../TeaStore-Benchmark` to current location before you can run:
```sh
git clone https://github.com/giltene/wrk2 && cd wrk2 && make && cd ..
export PATH=$PATH:/.../TeaStore-Benchmark/wrk2
```

### Generate CSV and run benchmark
```sh
cd csv-generator && npm start -- --seed=42 --threads=2 --loops=100 && cd .. && \
wrk -t2 -c100 -R2000 -L -s ./workload.lua http://localhost:80
```

---

## Setup (only libcurl)
### Follow https://github.com/curl/curl/blob/master/docs/HTTP3.md#quiche-version
Check for `BoringSSL`, `quiche/X.Y.Z` and `HTTP/3` support
```sh
curl --version
```
Could be 
```sh
curl 7.78.0-DEV (x86_64-pc-linux-gnu) libcurl/7.78.0-DEV BoringSSL quiche/X.Y.Z
...
Features: ... HTTP3 ...
```

### Generate CSV, compile C code and run benchmark

```sh
cd csv-generator && npm start -- --seed=42 --threads=1 --loops=100 && cd .. && make && ./benchmark
```
