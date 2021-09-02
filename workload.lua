-- Apache-2.0 License
-- use csv workload data
local open = io.open
local counter = 0
local threads = {}
local requestData = {}

local function read_line(path)
  local file = open(path, "r") -- read mode
  --if not file then return nil end
  local requests = {}

  for line in io.lines(path) do
    local method, url, body = line:match("([^;]*);([^;]*);([^;]*);")
    requests[#requests+1] = { method = method, url = url, body = body }
  end

  file:close()

  return requests
end

function setup(thread)
  requestData = read_line("./workload-" .. counter .. ".csv")
  thread:set("id", counter)
  table.insert(threads, thread)
  counter = counter + 1
end

-- TODO Manipulate requests / use requestData
-- wrk.method = "POST"
-- wrk.body   = "foo=bar&baz=quux"
-- wrk.headers["Content-Type"] = "application/x-www-form-urlencoded"
--response = function(status, headers, body)
--    wrk.headers["Cookie"] = ''
--    for key, value in pairs(headers) do
--        if string.starts(key, "Set-Cooki") then
--            wrk.headers["Cookie"] = wrk.headers["Cookie"] .. string.sub(value, 0, string.find(value, ";") - 1) .. ';'
--        end
--    end
--    cookie = true
--end

function init(args)
  requests  = 0
  responses = 0

  local msg = "thread %d created"
  print(msg:format(id))
end

function request()

  requests = requests + 1
  return wrk.request()
end

function response(status, headers, body)
  responses = responses + 1
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
