<?php
	require_once '../template/php/templater.php';
	$page = new Template("../template/templates/main.tpl.php");
	$view = new Template("templates/viz.tpl.php");
	$header = new Template("templates/header.tpl.php");
	
	$page->title = "FGH Viz";
    $page->body=$view->render(false);
    $page->head=$header->render(false);

    $page->release_text="Released December 2014";
    $page->help = array(
		'url' => 'http://www.healthdata.org/data-visualization/mdg-viz',
	);
    
	$page->render();
?>