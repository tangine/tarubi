let subscribers = {}

function publish(eventName, ...args) {
  if(subscribers[eventName]) {
    const promises = subscribers[eventName].map(callback => callback(...args))
    return Promise.all(promises)
  }
}

function subscribe(eventName, callback) {
  if(subscribers[eventName] === undefined) {
    subscribers[eventName] = new Set()
  }

  subscribers[eventName].push(callback)

  return function unsubscribe() {
    subscribers[eventName] = subscribers[eventName].filter(cb => cb !== callback)
  }
}