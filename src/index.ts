import { handleRequest, handleScheduled } from './handler'
import { Router } from 'itty-router'
// now let's create a router (note the lack of "new")

// attach the router "handle" to the event handler
addEventListener('fetch', event => {
  global.FetchCtx=event;
  return event.respondWith(handleRequest(event.request))
})
addEventListener("scheduled", event => {
  event.waitUntil(handleScheduled(event))
})