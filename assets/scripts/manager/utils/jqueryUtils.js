import $ from 'jquery';


export const createDivInContainer = function($container) {
    var $newDiv = $('<div />');
    $container.append($newDiv);

    return $newDiv;
};
