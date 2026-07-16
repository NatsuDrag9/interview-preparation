import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, of, from } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, map } from "rxjs/operators";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  standalone: true,
  styleUrls: ["./autocomplete-search.css"],
  templateUrl: "./autocomplete-search.template.html",
  imports: [CommonModule],
  selector: "app-autocomplete-search",
})
export class AutocompleteSearch implements OnInit, OnDestroy {
  searchValue: string = "";
  results: any[] = [];
  showResults: boolean = false;
  activeIndex: number = -1;
  cache: {[key: string]: any[]} = {};

  // RxJS Streams
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Inject DomSanitizer to allow <strong> tags in highlightMatch to be rendered in the UI
  constructor(private sanitizer: DomSanitizer) {};

  ngOnInit() {
    // Setting up the debounce and cancellation stream
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query.trim() === "") {
          return of({ recipes: [] });
        }

        // Check the cache
        if(this.cache[query]) {
          console.log("Returning from cache: ", query);
          return of({recipes: this.cache[query]});
        }
        
        return fromFetch(`https://dummyjson.com/recipes/search?q=${query}`).pipe(
          switchMap(response => {
            if (response.ok) {
              return from(response.json()).pipe(map((data: any) => (
                {query, recipes: data.recipes || []}
              )));
            } else {
              return of({ query, recipes: [] });
            }
          }),
          catchError((err) => {
            console.error("API error:", err);
            return of({ recipes: [] });
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      if(this.searchValue.trim() !== "") {
        this.cache[this.searchValue] = data.recipes || [];
      }
      this.results = data.recipes || [];
      this.activeIndex = -1;
    });
  }

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;

    if (value.trim() === "") {
      this.results = [];
      this.showResults = false;
      return;
    }

    this.showResults = true;
    // Push the new value into our RxJS stream instead of calling fetchData directly
    this.searchSubject.next(value);
  }

  // Stub function to prevent compilation errors in template
  selectItem(name: string) {
    this.searchValue = name;
    this.results = [];
    this.showResults = false;
  }

  // Stub function to prevent compilation errors in template
  highlightMatch(text: string, query: string): SafeHtml {
    if(!query) {
      return this.sanitizer.bypassSecurityTrustHtml(text);
    }

    // Regex sanitization check and splitting text into parts
    const escapedQuery = query.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

    // Map over the parts and wrap matches in <strong> tags
    const highlightedHtml = parts.map((part) => (part.toLowerCase() === query.toLowerCase() ? `<strong>${part}</strong>`: part));

    return this.sanitizer.bypassSecurityTrustHtml(highlightedHtml.join(""));
  }

  onFocus() {
    this.showResults = true;
  }

  onBlur() {
    setTimeout(() => {
      this.showResults = false;
    }, 150);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.results.length === 0) return;

    if (event.key === "Escape") {
      this.showResults = false;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.activeIndex = this.activeIndex <= 0 ? this.results.length - 1 : this.activeIndex - 1;
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.activeIndex = this.activeIndex === this.results.length - 1 ? 0 : this.activeIndex + 1;
    }
  }

  ngOnDestroy() {
    // Unsubscribe from stream to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }
}