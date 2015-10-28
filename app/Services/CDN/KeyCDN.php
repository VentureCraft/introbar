<?php namespace App\Services\CDN;
/*
 * Library for the KeyCDN API
 *
 * @author Tobias Moser
 * @version 0.1
 *
 */

use Config;

class KeyCDN implements CDNInterface
{

    public $api_key;
    public $zone_id;
    public $zone_url;
    public $KeyCDN_api = 'https://www.keycdn.com';


    public function __construct() {
        $this->api_key = config('services.keycdn.api_key');
        $this->zone_id = config('services.keycdn.zone_id');
        $this->zone_url = config('services.keycdn.zone_url');
    }

    public function purgeFile($fileName) {
        $fileName = $this->zone_url . $fileName;
        return $this->get('zones/purgeurl/'.$this->zone_id.'.json?path=' . $fileName);
    }

    public function get($selected_call, $params = array()) {
        return $this->execute($selected_call, 'GET', $params);
    }

    public function post($selected_call, $params = array()) {
        return $this->execute($selected_call, 'POST', $params);
    }

    public function put($selected_call, $params = array()) {
        return $this->execute($selected_call, 'PUT', $params);
    }

    public function delete($selected_call, $params = array()) {
        return $this->execute($selected_call, 'DELETE', $params);
    }


    private function execute($selected_call, $method_type, $params) {

        $endpoint = $this->KeyCDN_api.'/'.$selected_call;

        // start with curl and prepare accordingly
        $ch = curl_init();

        // create basic auth information
        curl_setopt($ch, CURLOPT_USERPWD, $this->api_key . ':');

        // return transfer as string
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        // set curl timeout
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        // retrieve headers
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT, 1);

        // set request type
        if ($method_type != 'POST' && $method_type != 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method_type);
        }

        $query_str = http_build_query($params);
        // send query-str within url or in post-fields
        if ($method_type == 'POST' || $method_type == 'PUT' || $method_type == 'DELETE') {
            $req_uri = $endpoint;
            curl_setopt($ch, CURLOPT_POSTFIELDS, $query_str);
        } else if ($query_str) {
            $req_uri = $endpoint .'?'. $query_str;
        } else {
            $req_uri = $endpoint;
        }

        // url
        curl_setopt($ch, CURLOPT_URL, $req_uri);

        // make the request
        $result = curl_exec($ch);
        $headers = curl_getinfo($ch);
        $curl_error = curl_error($ch);

        curl_close($ch);

        // get json_output out of result (remove headers)
        $json_output = substr($result, $headers['header_size']);

        // error catching
        if (!empty($curl_error) || empty($json_output)) {
            throw new \Exception('KeyCDN-Error: '.$curl_error.', Output: '.$json_output);
        }

        return $json_output;

    }

}