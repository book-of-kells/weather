const axios = require("axios") //.default
const settle = require('axios/lib/core/settle');
const dispatchRequest = require('axios/lib/core/dispatchRequest');
const MockAdapter = require("axios-mock-adapter")
import weatherResponse, {mockResponse} from './interfaces'

/**
 * GLOBALS
 */
export const apiKey = "baf2ff703c926aab6ba1d2e2ecdb2eec"

/*
 * TESTING CONFIG 
 */
export const testEpochTime = 1590459996
export const testKelvinTemp = 300
export const fakeData = {
    dt: testEpochTime,
    main: { temp: testKelvinTemp },
    cod: 200,
}
const handlerFunc = (config) => {
  logWeatherData(fakeData, `handlerFunc | At ${config.params.zip}`,  `handlerFunc | ${config.url}\n`)

  return new Promise((resolve, reject) => {
    resolve([200, {data: fakeData}])
    })
}
// `adapter` allows custom handling of requests which makes testing easier.
// Returns a promise and supply a valid response (see lib/adapters/README.md).
const axiosAdapter = (config) => {
  return new Promise(function(resolve, reject) {
    let response = dispatchRequest(config)
    let location = config.params.zip || config.params.q
    logWeatherData(response.data, `axiosAdapter | At ${location}`, `axiosAdapter | failed url: ${config.url}`)
    settle(resolve, reject, response)
  })

}

let axiosInstance = axios.create({
  baseURL: "https://api.openweathermap.org",
  url: "data/2.5/weather",
  params: {appid: apiKey},
})
export const mockAdapter = new MockAdapter(axiosInstance, {onNoMatch: 'passthrough'}).onGet(
  axiosInstance.defaults.url, 
  {params: {zip: "98166", ...axiosInstance.defaults.params}} // make variable from 98166
  ).reply(handlerFunc)

export const getDateTimeLogString = (epochSeconds: number): string => {
  const epochMilliseconds = epochSeconds * 1000
  const currentDatetime: Date = new Date(epochMilliseconds)
  return ` at the current time ${currentDatetime}`
}

export const getWeatherLogString = (kelvinTemp: number): string => {
  let celsiusTemp: number = kelvinTemp - 273.15
  const fahrenheitTemp: number = Math.round((celsiusTemp * 1.8 + 32) * 10) / 10
  celsiusTemp = Math.round(celsiusTemp * 10) / 10
  return `, it is ${celsiusTemp}ºC (${fahrenheitTemp}ºF).`
}

export const logWeatherData = (
  data: weatherResponse | mockResponse,
  logString: string,
  errorString?: string
) => {

  // if errors, log error message and exit program
  if (data.cod != 200) {
    console.log(errorString)
    return
  }

  // add current datetime
  logString += getDateTimeLogString(data.dt)
  // add weather information
  logString += getWeatherLogString(data.main.temp)
  console.log(logString)
}



export const getAndLogWeatherWithAxios = async (inputArr: string[]) => {
  /*
  todo use Promise.all -- an improvement over foreach for the loop
    // await axiosInstance.all() ?
  */
  await inputArr.forEach(async (loc: string) => {
    let location = loc.replace("./weather ", "").trim()
    let params = isNaN(Number(location)) ? {"q": location} : {"zip": location}
    params["appid"] = axiosInstance.defaults.params.appid

    await axiosInstance.get(axiosInstance.defaults.url, {params: params}).then(resp => {
        // resp.data.data is for the mocks
        logWeatherData(resp.data.data || resp.data, `getAndLogWeatherWithAxios | At ${location}`, `getAndLogWeatherWithAxios | failed url: ${axiosInstance.defaults.url} for ${params.q || params.zip} bc resp.data.keys is ${Object.keys(resp.data)}`)
    }).catch(err => {
      if (err.isAxiosError) {
        console.log(`axiosError | ${err.name} for ${location} at url ${err.config.url}`)
        console.log(`axiosError | ${err.stack}`)
      } else {
        console.log(`error | ${err}`)
      }      
    })

  })
}

if (!module.parent) {
  getAndLogWeatherWithAxios([
    "./weather New York",
    "10005",
    "Tokyo",
    "Pluto",
    "Seattle",
    "São Paulo",
    "98166"
  ])
}
