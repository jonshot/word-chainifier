(ns word-chainifier.core
  (:use compojure.core
        ring.util.response
        ring.middleware.cors
        ring.middleware.json-params
        org.httpkit.server)
  (:require [compojure.route :as route]
            [compojure.handler :as handler]
            [ring.middleware.reload :as reload]
            [cheshire.core :refer :all]
            [word-chainifier.build-chain :as chain])
  (:gen-class))

  (defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json; charset=utf-8"}
   :body (generate-string  data)})

(defroutes paths
  (GET "/build-chain/" {params :params}  [^String start-word ^String end-word]
       (json-response (chain/build-chain params)))
  (route/not-found (json-response {:error "Not found"})))

(def app
  (-> (handler/site paths)
    reload/wrap-reload
    wrap-json-params
    (wrap-cors :access-control-allow-origin #".+")))

(defn -main [& args]
 (run-server #'app {:port 80}))
