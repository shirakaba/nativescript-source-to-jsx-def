type Color = import("@nativescript/core/color/color").Color;
type DrawerTransitionBase = import("nativescript-ui-sidedrawer/index").DrawerTransitionBase;
type PropertyChangeData = import("@nativescript/core/data/observable/observable").PropertyChangeData;
type SideDrawerLocation = import("nativescript-ui-sidedrawer/index").SideDrawerLocation;
type View = import("@nativescript/core/ui/core/view/view").View;

// index.d.ts
export type RadSideDrawerAttributes = ViewAttributes & {
    allowEdgeSwipe?: string | boolean;
    android?: any;
    drawerContent?: string | View;
    drawerContentSize?: string | number;
    drawerLocation?: SideDrawerLocation;
    drawerTransition?: string | DrawerTransitionBase;
    gesturesEnabled?: string | boolean;
    ios?: any;
    mainContent?: string | View;
    onAllowEdgeSwipeChange?: (args: PropertyChangeData) => void;
    onDrawerContentChange?: (args: PropertyChangeData) => void;
    onDrawerContentSizeChange?: (args: PropertyChangeData) => void;
    onDrawerLocationChange?: (args: PropertyChangeData) => void;
    onDrawerTransitionChange?: (args: PropertyChangeData) => void;
    onGesturesEnabledChange?: (args: PropertyChangeData) => void;
    onMainContentChange?: (args: PropertyChangeData) => void;
    onShadowColorChange?: (args: PropertyChangeData) => void;
    shadowColor?: string | Color;
};





import { registerElement, NSVElement, NSVViewFlags } from "react-nativescript";

registerElement(
    'radSideDrawer',
    () => require('nativescript-ui-sidedrawer')["RadSideDrawer"],
        {
      nodeOps: {
        insert(child: NSVElement, parent: NSVElement, atIndex?: number): void {
          // You need to fill this in!
        },
        remove(child: NSVElement, parent: NSVElement): void {
          // You need to fill this in!
        }
      }
    }
);
