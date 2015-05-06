<?php namespace App\Services\CDN;

interface CDNInterface
{
    public function purgeFile($filename);

    public function get($endpoint, $params = array());

    public function post($endpoint, $params = array());

    public function put($endpoint, $params = array());

    public function delete($endpoint, $params = array());
}