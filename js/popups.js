import { fireEvent } from "card-tools/src/event";
import { load_lovelace, lovelace } from "card-tools/src/hass";
import { moreInfo } from "card-tools/src/more-info";
import { closePopUp, popUp } from "card-tools/src/popup";

export const BrowserModPopupsMixin = (C) => class extends C {

    constructor() {
        super();
        if (document.querySelector("home-assistant"))
            document.querySelector("home-assistant").addEventListener("hass-more-info", (ev) => this._popup_card(ev));

        const isCast = document.querySelector("hc-main") !== null;
        if(!isCast)
            load_lovelace();
    }

    _popup_card(ev) {
        
        var d;
        
        if(!lovelace()) return;
        if(!ev.detail || !ev.detail.entityId) return;
        const data = {
            ...lovelace().config.popup_cards,
            ...lovelace().config.views[lovelace().current_view].popup_cards,
        };
        d = data[ev.detail.entityId];
        if(!d) {
            const data = {
                ...lovelace().config.popup_cards_domain,
                ...lovelace().config.views[lovelace().current_view].popup_cards_domain,
            };
            d = data[ev.detail.entityId.split(".")[0]];
            if(!d) return;
            var friendlyname = hass().states[ev.detail.entityId].attributes.friendly_name;
            d = JSON.parse(JSON.stringify(d).replace(/###ENTITYID###/g, ev.detail.entityId));
            d = JSON.parse(JSON.stringify(d).replace(/###ENTITY###/g, ev.detail.entityId.split(".")[1]));
            d = JSON.parse(JSON.stringify(d).replace(/###ENTITYNAME###/g,friendlyname));
            }

        popUp(
            d.title,
            d.card,
            d.large || false,
            d.style
        );
        window.setTimeout(() => {
            fireEvent("hass-more-info", {entityID: "."}, document.querySelector("home-assistant"));
        }, 50);
    }

    do_popup(cfg) {
        if (!(cfg.title || cfg.auto_close || cfg.hide_header)) return;
        if (!cfg.card) return;

        const open = () => {
            popUp(
                cfg.title,
                cfg.card,
                cfg.large,
                cfg.style,
                cfg.auto_close || cfg.hide_header,
            );
        };

        if(cfg.auto_close) {
            this.screensaver_set(open, closePopUp, cfg.time);
        } else {
            open();
        }
    }

    do_close_popup() {
        this.screensaver_stop();
        closePopUp();
    }

    do_more_info(entity_id, large) {
        if (!entity_id) return;
        moreInfo(entity_id, large);
    }

    do_toast(message, duration) {
        if (!message) return;
        fireEvent("hass-notification", {
            message,
            duration: parseInt(duration),
        }, document.querySelector("home-assistant"));
    }


}
