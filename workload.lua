-- Apache-2.0 License
-- use csv workload data
local open = io.open
local counter = 0
local threads = {}
local requestData = {}

local function read_line(filePath)
  local file = open(filePath, "r") -- read mode
  --if not file then return nil end
  local requests = {}
  local index = 0
  for line in io.lines(filePath) do
    local method, path, body = (line .. ";"):match("([^;]*);([^;]*);([^;]*);")
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

-- TODO Use headers/cookies
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
  requestData = read_line("./workload-" .. id .. ".csv")

  local msg = "thread %d created"
  print(msg:format(id))
end

function request()
  local method = requestData[requests].method
  local path = requestData[requests].path
  local body = requestData[requests].body
  local headers = {}
  if (body == nil or body ~= '') then
    body = nil
  end
  requests = requests + 1 
  return wrk.format(method, path, headers, body)
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
