const CACHE_NAME = "upt-r-v2";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./service-worker.js",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener(
  "install",
  event => {

    self.skipWaiting();

    event.waitUntil(

      caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(
          STATIC_FILES
        );
      })
    );
  }
);

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
      .then(keys => {

        return Promise.all(

          keys.map(key => {

            if (
              key !== CACHE_NAME
            ) {

              return caches.delete(
                key
              );
            }
          })
        );
      })
      .then(() => {

        return self.clients.claim();
      })
    );
  }
);

self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !== "GET"
    ) {
      return;
    }

    const url =
      new URL(event.request.url);

    const isHTML =
      event.request.headers.get(
        "accept"
      )?.includes("text/html");

    if (isHTML) {

      event.respondWith(

        fetch(event.request)
        .then(response => {

          const clone =
            response.clone();

          caches.open(CACHE_NAME)
          .then(cache => {

            cache.put(
              event.request,
              clone
            );
          });

          return response;
        })
        .catch(() => {

          return caches.match(
            event.request
          );
        })
      );

      return;
    }

    event.respondWith(

      caches.match(event.request)
      .then(cached => {

        return (
          cached ||
          fetch(event.request)
        );
      })
    );
  }
);
