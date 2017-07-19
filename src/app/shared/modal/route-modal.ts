import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router/src/router';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'bi-route-modal',
    template: `
        <div class="modal route-modal bootstrap-dialog type-primary"
             tabindex="-1"
             role="dialog"
             #modalRoot
             (keydown.esc)="closeOnEscape ? close() : 0"
             [ngClass]="{'in': isOpened, 'fade': isOpened}"
             [ngStyle]="{'display': isOpened ? 'block' : 'none'}"
             (click)="closeOnOutsideClick ? close() : 0">
            <div [class]="'modal-dialog ' + modalClass" (click)="preventClosing($event)">
                <div class="modal-content" tabindex="0" *ngIf="isOpened">
                    <div class="modal-header">
                        <div class="bootstrap-dialog-header">
                            <div class="bootstrap-dialog-close-button" style="display: block;">
                                <button *ngIf="!hideCloseButton" type="button" class="close" data-dismiss="modal"
                                        [attr.aria-label]="cancelButtonLabel || 'Close'" (click)="close()"><span
                                        aria-hidden="true">&times;</span></button>
                            </div>
                            <div class="bootstrap-dialog-title">
                                <ng-content select="bi-modal-header"></ng-content>
                                <h4 class="modal-title" *ngIf="title">{{ title }}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <ng-content select="bi-modal-content"></ng-content>
                    </div>
                    <div class="modal-footer">
                        <ng-content select="bi-modal-footer"></ng-content>
                        <button *ngIf="cancelButtonLabel" type="button" class="btn btn-default" data-dismiss="modal"
                                (click)="close()">{{ cancelButtonLabel }}
                        </button>
                        <button *ngIf="submitButtonLabel" type="button" class="btn btn-primary"
                                (click)="onSubmit.emit(undefined)">{{ submitButtonLabel }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RouteModalComponent implements OnInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Inputs
    // -------------------------------------------------------------------------

    @Input()
    public cancelUrl: any[];

    @Input()
    public cancelUrlExtras: { relative: boolean } & NavigationExtras;

    @Input()
    public modalClass: string;

    @Input()
    public closeOnEscape = true;

    @Input()
    public closeOnOutsideClick = true;

    @Input()
    public title: string;

    @Input()
    public hideCloseButton = false;

    @Input()
    public cancelButtonLabel: string;

    @Input()
    public submitButtonLabel: string;

    @Input()
    public backdrop = true;

    // -------------------------------------------------------------------------
    // Outputs
    // -------------------------------------------------------------------------

    @Output()
    public onOpen = new EventEmitter(false);

    @Output()
    public onClose = new EventEmitter(false);

    @Output()
    public onSubmit = new EventEmitter(false);

    // -------------------------------------------------------------------------
    // Private properties
    // -------------------------------------------------------------------------

    @ViewChild('modalRoot')
    public modalRoot: ElementRef;

    public isOpened = false;

    private backdropElement: HTMLElement;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute) {
        this.createBackDrop();
    }

    // -------------------------------------------------------------------------
    // Lifecycle Methods
    // -------------------------------------------------------------------------

    ngOnInit() {
        this.open();
    }

    ngOnDestroy() {
        document.body.className = document.body.className.replace(/modal-open\b/, '');
        if (this.backdropElement && this.backdropElement.parentNode === document.body) {
            document.body.removeChild(this.backdropElement);
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    open(...args: any[]) {
        if (this.isOpened) {
            return;
        }
        this.isOpened = true;
        this.onOpen.emit(args);
        document.body.appendChild(this.backdropElement);
        window.setTimeout(() => this.modalRoot.nativeElement.focus(), 0);
        document.body.className += ' modal-open';
    }

    close(...args: any[]) {
        if (!this.isOpened) {
            return;
        }
        this.isOpened = false;
        this.onClose.emit(args);
        document.body.className = document.body.className.replace(/modal-open\b/, '');

        if (this.cancelUrl) {
            let navigationExtras: NavigationExtras = {};
            if (this.cancelUrlExtras) {
                if (this.cancelUrlExtras.relative) {
                    navigationExtras.relativeTo = this.activatedRoute;
                }
                navigationExtras = (Object as any).assign(navigationExtras, this.cancelUrlExtras);
            }
            this.router.navigate(this.cancelUrl, navigationExtras);

        } else {
            window.history.back();
        }
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    public preventClosing(event: MouseEvent) {
        event.stopPropagation();
    }

    private createBackDrop() {
        this.backdropElement = document.createElement('div');
        this.backdropElement.classList.add('fade');
        this.backdropElement.classList.add('in');
        if (this.backdrop) {
            this.backdropElement.classList.add('modal-backdrop');
        }
    }

}
