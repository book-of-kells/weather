const weather = require("./weather.ts")

/**
 * GLOBALS
 */
const mockAdapter = weather.mockAdapter
const fakeData = weather.fakeData
const testEpochTime = weather.testEpochTime
const testKelvinTemp = weather.testKelvinTemp

/**
 * TESTS
 */

beforeEach(() => {
  // initialize
})

afterEach(() => {
  // if necessary, mockAdapter.reset() after each call here
  mockAdapter.resetHistory()
})


test("getDateTimeLogString converts correctly", () => {
  const epochSeconds = 1590459956
  const timeLogString = weather.getDateTimeLogString(epochSeconds)
  expect(timeLogString).toBe(
    " at the current time Mon May 25 2020 19:25:56 GMT-0700 (Pacific Daylight Time)"
  )
})

test("getWeatherLogString outputs correctly", () => {
  const weatherLogString = weather.getWeatherLogString(300)
  expect(weatherLogString).toBe(", it is 26.9ºC (80.3ºF).")
})

test("logWeatherData aborts on 403", () => {

  const inputData = {
    errors: [{ message: "Test-error-message" }],
    cod: 403,
  }
  let outputData = ""
  const storeLog = (inputs) => (outputData += inputs)
  console["log"] = jest.fn(storeLog)
  const spyDateTime = jest.spyOn(weather, "getDateTimeLogString")

  weather.logWeatherData(inputData, "test-start", "test-error-string")


  expect(spyDateTime).not.toBeCalled()
  expect(storeLog("")).toBe("test-error-string") // + inputData)
})

test("logWeatherData logs correctly", () => {

  let outputData = ""
  const storeLog = (inputs) => (outputData += inputs)
  console["log"] = jest.fn(storeLog)

  const fakeGetWeatherLogString = " fake-getWeatherLogString"
  const fakeGetDateTimeLogString = " fake-getDateTimeLogString"
  const spyDateTime = jest
    .spyOn(weather, "getDateTimeLogString")
    .mockImplementation(() => {
      return fakeGetDateTimeLogString
    })
  const spyWeather = jest
    .spyOn(weather, "getWeatherLogString")
    .mockImplementation(() => {
      return fakeGetWeatherLogString
    })

  weather.logWeatherData(fakeData, "test-start", "test-error-string")

  expect(spyDateTime.mock.results.length).toBe(1)
  expect(spyDateTime.mock.results[0]["value"]).toBe(fakeGetDateTimeLogString)
  expect(spyDateTime).toBeCalledWith(testEpochTime)
  expect(spyDateTime.mock.calls[0].length).toBe(1)
  expect(spyDateTime.mock.calls[0][0]).toBe(testEpochTime)


  expect(spyWeather.mock.results[0]["value"]).toBe(fakeGetWeatherLogString)
  expect(spyWeather).toBeCalledWith(testKelvinTemp)
  expect(spyWeather.mock.calls[0].length).toBe(1)
  expect(spyWeather.mock.calls[0][0]).toBe(testKelvinTemp)
  expect(storeLog("")).toBe(
    "test-start" + fakeGetDateTimeLogString + fakeGetWeatherLogString
  )
})


test("getAndLogWeatherWithAxios calls axios and callAPILogResults", async () => {
  const spyLogWeatherData = jest.spyOn(weather, "logWeatherData").mockImplementation(jest.fn((data) => {}))
  await weather.getAndLogWeatherWithAxios(["98166"])

  expect(mockAdapter.history.get.length).toBe(1)
  expect(spyLogWeatherData).toBeCalled()
  expect(spyLogWeatherData).toBeCalledWith(
    fakeData, `handlerFunc | At 98166`, `handlerFunc | data/2.5/weather\n`
    )
})

// todo test axios catch err

// todo use describe




