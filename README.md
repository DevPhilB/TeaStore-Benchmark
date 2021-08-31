# TeaStore v2 Benchmark
Custom benchmark tool using [libcurl](https://curl.se/libcurl).  
Designed for [TeaStore v2](https://github.com/DevPhilB/TeaStore).

## Setup (WIP)
### Unzip & copy files
```sh
unzip curl.zip
```

### Folders
### - bin
```sh
 cp -a /curl/bin/. /usr/local/bin/
```

### - include
```sh
cp -a /curl/include/. /usr/local/include/
```

### - lib
```sh
 cp /curl/lib/libcurl.so.4 /usr/lib/x86_64-linux-gnu/libcurl.so.4
 cp /curl/lib/libcurl.so.4.7.0 /usr/lib/x86_64-linux-gnu/libcurl.so.4.7.0

 cp /curl/lib/libcurl.a /usr/local/lib/libcurl.a
 cp /curl/lib/libcurl.la /usr/local/lib/libcurl.la
 cp /curl/lib/libcurl.so /usr/local/lib/libcurl.so
```

### - quiche
```sh
 cp /quiche/lib/libquiche.a /usr/lib/x86_64-linux-gnu/libquiche.a
 cp /quiche/lib/libquiche.so /usr/lib/x86_64-linux-gnu/libquiche.so
```

## Clean up
```sh
 rm -r curl quiche
```

## Generate CSV, compile C code and run benchmark
```sh
 cd csv-generator && npm start && cd .. && make && ./benchmark
```
