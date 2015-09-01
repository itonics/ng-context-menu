/**
 * ng-context-menu - v1.0.1 - An AngularJS directive to display a context menu
 * when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
angular
  .module('ng-context-menu', [])
  .factory('ContextMenuService', function () {
    return {
      element: null,
      menuElement: null
    };
  })
  .directive('contextMenu', [
    '$document',
    'ContextMenuService',
    '$timeout',
    function ($document, ContextMenuService) {
      return {
        restrict: 'A',
        scope: {
          'callback': '&contextMenu',
          'disabled': '=contextMenuDisabled',
          'closeCallback': '&contextMenuClose'
        },
        link: function ($scope, $element, $attrs) {
          var opened = false;

          // LEB::
          var longPressEnabled = $attrs["contextMenuLongPress"];
          var longClickTimer = null;


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

            if (totalWidth > docWidth) {
              left = left - (totalWidth - docWidth);
            }

            if (totalHeight > docHeight) {
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

            if (opened) {
              $scope.closeCallback();
            }

            opened = false;
            $document.unbind('keyup.context-menu', handleKeyUpEvent);
            $document.unbind('click.context-menu', handleClickEvent);
            $document.unbind('contextmenu.context-menu', handleClickEvent);
            $document.unbind('scroll.context-menu-event', handleClickEvent);
          }

          if (!$scope.disabled) {
            $element.bind('contextmenu', handleContextMenuShow);
          }


          function handleContextMenuShow(event, posX, posY) {
            posX = (typeof posX === 'undefined') ? event.pageX : posX;
            posY = (typeof posY === 'undefined') ? event.pageY : posY;

            if (!$scope.disabled) {
              if (ContextMenuService.menuElement !== null) {
                close(ContextMenuService.menuElement);
              }
              ContextMenuService.menuElement = angular.element(
                document.getElementById($attrs.target)
              );
              ContextMenuService.element = event.target;

              event.preventDefault();
              event.stopPropagation();
              $scope.$apply(function () {
                $scope.callback({$event: event});
              });
              $scope.$apply(function () {
                open(event, ContextMenuService.menuElement, posX, posY);
              });
            }
          }

          function handleKeyUpEvent(event) {
            //console.log('keyup');
            if (!$scope.disabled && opened && event.keyCode === 27) {
              $scope.$apply(function () {
                close(ContextMenuService.menuElement);
              });
            }
          }

          function handleClickEvent(event) {
            if (!$scope.disabled &&
              opened &&
              (event.button !== 2 ||
              event.target !== ContextMenuService.element)) {
              $scope.$apply(function () {
                close(ContextMenuService.menuElement);
              });
            }
          }


          // Customized for LEB :: show context menu on long press on iPad/Touch devices
          /*if(typeof longPressEnabled !== 'undefined'){
           var longPressTO = parseInt(longPressEnabled) || 1000;
           $document.unbind('click', handleClickEvent);

           $element.on("touchstart", function(e) {
           var touchEnd;
           var touchStart = touchEnd = e.originalEvent.changedTouches[0].pageY;

           $document.unbind('touchstart', handleClickEvent);

           if(ContextMenuService.menuElement){
           ContextMenuService.menuElement.removeClass('touchClickEnabled');
           }

           var touchExceeded = false;

           $element.on("touchmove", function(e) {
           touchEnd = e.originalEvent.changedTouches[0].pageY;

           if(touchExceeded || touchStart - touchEnd > 50 || touchEnd - touchStart > 50) {
           e.preventDefault();
           touchExceeded = true;
           }
           });

           longClickTimer = $timeout(function() {
           handleContextMenuShow(e, e.originalEvent.changedTouches[0].pageX + 10,  e.originalEvent.changedTouches[0].pageY + 10);
           },longPressTO);

           $element.on("touchend", function(e) {
           $timeout.cancel(longClickTimer);
           $document.unbind('touchstart', handleClickEvent);
           $timeout(function(){
           //$document.bind('click', handleClickEvent);
           if(ContextMenuService.menuElement){
           ContextMenuService.menuElement.addClass('touchClickEnabled');
           }
           $document.bind('touchstart', handleClickEvent);
           },500);
           $element.off("touchmove touchend");
           });
           });

           }*/

          $scope.$on('$destroy', function () {
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
