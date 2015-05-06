<?php namespace App\Commands;

use CDN;

use App\Commands\Command;

use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Bus\SelfHandling;
use Illuminate\Contracts\Queue\ShouldBeQueued;

class ClearCDN extends Command implements SelfHandling, ShouldBeQueued
{

    use InteractsWithQueue, SerializesModels;

    private $site_uid;
    private $site_domain;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct($site_uid, $site_domain)
    {
        $this->site_uid = $site_uid;
        $this->site_domain = $site_domain;
    }

    /**
     * Execute the command.
     *
     * @return void
     */
    public function handle(CDN $cdn)
    {
        $cdn->purgeFile(
            'v1/bar/' . $this->site_uid . '/' . $this->site_domain . '.html'
        );
    }

}
