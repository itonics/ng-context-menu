/**
 * ng-context-menu - v1.0.1 - An AngularJS directive to display a context menu
 * when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
angular
    .module('ng-context-menu', [])
    .factory('ContextMenuService', function() {
        return {
            element: null,
            menuElement: null
        };
    })
    .directive('contextMenu', [
        '$document',
        'ContextMenuService',
        '$timeout',
        function($document, ContextMenuService, $timeout) {
            return {
                restrict: 'A',
                scope: {
                    'callback': '&contextMenu',
                    'disabled': '=contextMenuDisabled',
                    'closeCallback': '&contextMenuClose',
                    'contextDelay': '=?'
                },
                link: function($scope, $element, $attrs) {
                    var opened = false;

                    function open(event, menuElement, posX, posY) {

                        menuElement.addClass('open');

                        var doc = $document[0].documentElement;
                        var docLeft = (window.pageXOffset || doc.scrollLeft) -
                                (doc.clientLeft || 0),
                            docTop = (window.pageYOffset || doc.scrollTop) -
                                (doc.clientTop || 0),
                            elementWidth = menuElement[0].scrollWidth,
                            elementHeight = menuElement[0].scrollHeight;
                        var docWidth = doc.clientWidth + docLeft,
                            docHeight = doc.clientHeight + docTop,
                            totalWidth = elementWidth + posX,
                            totalHeight = elementHeight + posY,
                            left = Math.max(posX - docLeft, 0),
                            top = Math.max(posY - docTop, 0);

                        if(totalWidth > docWidth) {
                            left = left - (totalWidth - docWidth);
                        }

                        if(totalHeight > docHeight) {
                            top = top - (totalHeight - docHeight);
                        }

                        menuElement.css('top', top + 'px');
                        menuElement.css('left', left + 'px');
                        opened = true;

                        $document.bind('keyup.context-menu', handleKeyUpEvent);
                        // Firefox treats a right-click as a click and a contextmenu event
                        // while other browsers just treat it as a contextmenu event
                        $document.bind('click.context-menu', handleClickEvent);
                        $document.bind('contextmenu.context-menu', handleClickEvent);
                        //angular.element($window).unbind('.context-menu-event');
                        $document.bind('scroll.context-menu-event', handleClickEvent);
                    }

                    function close(menuElement) {
                        menuElement.removeClass('open');

                        if(opened) {
                            $scope.closeCallback();
                        }

                        opened = false;
                        $document.unbind('keyup.context-menu', handleKeyUpEvent);
                        $document.unbind('click.context-menu', handleClickEvent);
                        $document.unbind('contextmenu.context-menu', handleClickEvent);
                        $document.unbind('scroll.context-menu-event', handleClickEvent);
                    }

                    if(!$scope.disabled) {
                        $element.bind('contextmenu', handleContextMenuShow);
                    }


                    function handleContextMenuShow(event, posX, posY) {
                        posX = (typeof posX === 'undefined') ? event.pageX : posX;
                        posY = (typeof posY === 'undefined') ? event.pageY : posY;

                        if(!$scope.disabled) {
                            if(ContextMenuService.menuElement !== null) {
                                close(ContextMenuService.menuElement);
                            }
                            ContextMenuService.menuElement = angular.element(
                                document.getElementById($attrs.target)
                            );
                            ContextMenuService.element = event.target;

                            event.preventDefault();
                            event.stopPropagation();
                            $scope.$apply(function() {
                                $scope.callback({$event: event});
                            });

                            if(parseInt($scope.contextDelay)){
                                $timeout(function(){
                                    $scope.$apply(function() {
                                        open(event, ContextMenuService.menuElement, posX, posY);
                                    });
                                }, parseInt($scope.contextDelay));
                            }else{
                                $scope.$apply(function() {
                                    open(event, ContextMenuService.menuElement, posX, posY);
                                });
                            }
                        }
                    }

                    function handleKeyUpEvent(event) {
                        //console.log('keyup');
                        if(!$scope.disabled && opened && event.keyCode === 27) {
                            $scope.$apply(function() {
                                close(ContextMenuService.menuElement);
                            });
                        }
                    }

                    function handleClickEvent(event) {
                        if(!$scope.disabled &&
                            opened &&
                            (event.button !== 2 ||
                            event.target !== ContextMenuService.element)) {
                            $scope.$apply(function() {
                                close(ContextMenuService.menuElement);
                            });
                        }
                    }

                    $scope.$on('$destroy', function() {
                        //console.log('destroy');
                        $document.unbind('touchstart', handleClickEvent);
                        $document.unbind('keyup', handleKeyUpEvent);
                        $document.unbind('click', handleClickEvent);
                        $document.unbind('contextmenu', handleClickEvent);
                    });
                }
            };
        }
    ]);
