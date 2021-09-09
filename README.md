# TeaStore v2 Benchmark
CSV generator (JavaScript) to generate workloads for n-Threads.  
Lua script to use these CSV workloads.  
Designed for [TeaStore v2](https://github.com/DevPhilB/TeaStore).

## Setup (for wrk2)
### Get and build wrk2
Change `/.../TeaStore-Benchmark` to current location before you can run:
```sh
git clone https://github.com/giltene/wrk2 && cd wrk2 && make && cd ..
export PATH=$PATH:/.../TeaStore-Benchmark/wrk2
```

*Loops = Req/s * duration / 10*

### Generate CSV and run benchmark
```sh
cd csv-generator && npm start -- --seed=42 --threads=10 --loops=150 && cd .. && \
wrk -t10 -c10 -d30s -R50 -L -s ./workload.lua http://localhost:80
```

---

**Development stopped** for custom benchmark tool, which uses [libcurl](https://curl.se/libcurl)!
## Setup (for custom benchmark tool)
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
cd csv-generator && npm start -- --seed=42 --threads=10 --loops=150 && cd .. && make && ./benchmark
```
