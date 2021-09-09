-- Apache-2.0 License
-- Use csv workload data
local open = io.open
local counter = 0
local index = 0
local requestIndex = 0
local threads = {}
local requestData = {}
local requestHeaders = {}

local function read_line(filePath)
  local file = open(filePath, "r") -- read mode
  local requests = {}
  for line in io.lines(filePath) do
    local method, path, body = (line .. ";"):match("([^;]*);([^;]*);([^;]*);")
    if (body == '') then body = nil end
    requests[index] = { method = method, path = path, body = body }
    index = index + 1
  end

  file:close()

  return requests
end

function setup(thread)
  thread:set("id", counter)
  table.insert(threads, thread)
  counter = counter + 1
end

function init(args)
  wrk.headers["Accept"] = "application/json"
  requestHeaders = wrk.headers
  requests  = 0
  responses = 0
  requestData = read_line("./workload-" .. id .. ".csv")

  local msg = "thread %d created"
  print(msg:format(id))
end

function request()
  if (index > requestIndex) then
    local method = requestData[requestIndex].method
    local path = requestData[requestIndex].path
    local body = requestData[requestIndex].body
    if (body == nil) then
      if (wrk.headers["Cookie"]) then
        local cookie = wrk.headers["Cookie"]
        wrk.headers = requestHeaders
        wrk.headers["Cookie"] = cookie
      else
        wrk.headers = requestHeaders
      end
    else
      wrk.headers["Content-Length"] = string.len(body)
      wrk.headers["Content-Type"] = "application/json"
    end
    requestIndex = requestIndex + 1
    requests = requests + 1
    return wrk.format(method, path, wrk.headers, body)
  end
end

function response(status, headers, body)
  responses = responses + 1
  -- Set cookie
  if (headers["Set-Cookie"]) then
    wrk.headers["Cookie"] = headers["Set-Cookie"]
  end
end

function done(summary, latency, requests)
  for index, thread in ipairs(threads) do
     local id        = thread:get("id")
     local requests  = thread:get("requests")
     local responses = thread:get("responses")
     local msg = "thread %d made %d requests and got %d responses"
     print(msg:format(id, requests, responses))
  end
end
