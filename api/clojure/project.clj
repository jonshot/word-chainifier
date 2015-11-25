(defproject word-chainifier-api "0.1"
  :description "Word Chainifier API"
  :url "http://example.com"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.7.0"]
                 [http-kit "2.1.18"]
                 [ring/ring-json "0.4.0"]
                 [ring-json-params "0.1.3"]
                 [ring-cors "0.1.7"]
                 [ring "1.4.0"]
                 [compojure "1.4.0"]
                 [clojure-csv/clojure-csv "2.0.1"]]
  :main word-chainifier-api.main
  :aot :all)