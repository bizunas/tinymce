define(
  'ephox.alloy.dropdown.Beta',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.dropdown.Gamma',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.epithet.Id',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (ComponentStructure, Composing, Coupling, Focusing, Keying, Positioning, Sandboxing, TieredMenu, Gamma, Tagger, Dismissal, Id, Merger, Future, Fun, Option, Attr, Remove, Width, Error) {
    
    var fetch = function (detail, component) {
      var fetcher = detail.fetch();
      return fetcher(component);
    };

    var openF = function (detail, anchor, component, sandbox, externals) {
      var futureData = fetch(detail, component);

      var lazySink = Gamma.getSink(component, detail);

      // TODO: Make this potentially a single menu also
      return futureData.map(function (data) {
        return TieredMenu.build(
          Merger.deepMerge(
            externals.menu(),
            {
              uid: Tagger.generate(''),
              data: data,

              onOpenMenu: function (sandbox, menu) {
                var sink = lazySink().getOrDie();
                Positioning.position(sink, anchor, menu);
              },

              onOpenSubmenu: function (sandbox, item, submenu) {
                var sink = lazySink().getOrDie();
                Positioning.position(sink, {
                  anchor: 'submenu',
                  item: item,
                  bubble: Option.none()
                }, submenu);

              },
              onEscape: function () {
                sandbox.getSystem().getByUid(detail.uid()).each(Focusing.focus);
                Sandboxing.close(sandbox);
                return Option.some(true);
              }
            }
          )
        );
      });

    };

    var open = function (detail, anchor, component, sandbox, externals) {
      var processed = openF(detail, anchor, component, sandbox, externals);
      return Sandboxing.open(sandbox, processed).map(function () {
        return sandbox;
      });
      // Sandboxing.open(sandbox, processed).get(function (tiers) {
      //   Highlighting.highlightFirst(tiers);
      //   Keying.focusIn(tiers);
      // });
    };

    var close = function (detail, anchor, component, sandbox) {
      Sandboxing.close(sandbox);
      // INVESTIGATE: Not sure if this is needed. 
      Remove.remove(sandbox.element());
      return Future.pure(sandbox);
    };

    var togglePopup = function (detail, anchor, hotspot, externals) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      var showing = Sandboxing.isOpen(sandbox);

      var action = showing ? close : open;
      return action(detail, anchor, hotspot, sandbox, externals);
    };

    var matchWidth = function (hotspot, container) {
      var menu = Composing.getCurrent(container).getOr(container);
      var buttonWidth = Width.get(hotspot.element());
      Width.set(menu.element(), buttonWidth);
    };

    var makeSandbox = function (detail, anchor, anyInSystem, extras) {
      var ariaId = Id.generate('aria-owns');


      var onOpen = function (component, menu) {
        Attr.set(anyInSystem.element(), 'aria-owns', ariaId);
        // TODO: Reinstate matchWidth
        if (detail.matchWidth()) matchWidth(anyInSystem, menu);
        detail.onOpen()(anchor, component, menu);
        if (extras !== undefined && extras.onOpen !== undefined) extras.onOpen(component, menu);
      };

      var onClose = function (component, menu) {
        Attr.remove(anyInSystem.element(), 'aria-owns');
        // FIX: Will need to do this for non split-dropdown
        // Toggling.deselect(hotspot);
        // FIX: Using to hack in turning off the arrow.
        if (extras !== undefined && extras.onClose !== undefined) extras.onClose(component, menu);
      };

      var lazySink = Gamma.getSink(anyInSystem, detail);

      return {
        uiType: 'custom',
        dom: {
          tag: 'div',
          attributes: {
            id: ariaId
          }
        },
        behaviours: {
          sandboxing: {
            onOpen: onOpen,
            onClose: onClose,
            isPartOf: function (container, data, queryElem) {
              return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(anyInSystem, queryElem);
            },
            bucket: {
              mode: 'sink',
              lazySink: lazySink
            }
          },
          composing: {
            find: function (sandbox) {
              return Sandboxing.getState(sandbox).bind(function (menu) {
                return Composing.getCurrent(menu);
              });
            }
          },
          receiving: Dismissal.receiving({
            isExtraPart: Fun.constant(false)
          })
        },
        events: { }
      };
    };
    

    return {
      makeSandbox: makeSandbox,
      togglePopup: togglePopup,
      open: open
    };
  }
);