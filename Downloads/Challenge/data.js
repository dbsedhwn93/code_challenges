
$("#confirm-button").attr("disabled", "disabled");
var colorSizeTrimSelector = {
    sizeData: {},
    colorData: {},
    trimData: {},
    sellType: "",
    trimSelected: { type: "", value: "", id: "", options: [] },
    sizeSelected: { type: "", value: "", id: "", options: [] },
    colorSelected: { type: "", value: "", id: "", options: [] },
    colorDisplayValues: {},
    trimDisplayValues: {},
    referenceIds: {},
    referenceId: "",
    nbAvailableOptions: { colors: 0, sizes: 0, trims: 0 },
    nbValuesSelected: 0,
    nbValueMax: 0,
    buttonClicked: false,
    types: {
        color: "color",
        size: "size",
        trim: "trim"
    },
    addSpringBox: (value) => {
        let springBoxs = $(".js-boxsizes").find("strong");
        value = "$" + value + ""
        // Create new money spring box
        if (springBoxs.length === 1) {
            let html = `<strong><span>${value}</span></strong>`;
            $(".js-boxsizes").append(html);
        } else {
            // Exist money spring box
            $(springBoxs[1]).find("span")[0].innerHTML = value;
        }
    },
    updateSelectedItems: function(selectedType, selectedValue, selectedIds) {
        var typesNotSelected = this.guessTypes(selectedType);
        var refId, idOfReference;

        // If  it's identical to a value that was already selected, we do nothing
        if (this[selectedType + "Selected"].value === selectedValue) return;

        if (this.nbValuesSelected === 3) {
            this.replaceValue(true);
            this.replaceValue(
                false,
                selectedValue,
                selectedType,
                selectedIds,
                this[selectedType + "Data"][unescape(selectedValue)]
            );
            this.referenceIds = {};
            this.referenceId = "";
            this.nbValuesSelected = 0;
        }

        if (this.nbValuesSelected >= 1) {
            if (!this.referenceId || (this[selectedType + "Selected"].value && this.nbValuesSelected >= 2))
                idOfReference = this.referenceIds;
            else idOfReference = this.referenceId;
            refId = this.checkIfIdFitsAndGetIt(idOfReference, selectedIds);
            if (refId) {
                if (this[selectedType + "Selected"].value && this.nbValuesSelected >= 2) {
                    this.nbValuesSelected--;
                }

                this.referenceId = refId;
                this.replaceValue(
                    false,
                    selectedValue,
                    selectedType,
                    selectedIds,
                    this[selectedType + "Data"][unescape(selectedValue)]
                );
            } else {
                this.replaceValue(true);
                this.replaceValue(
                    false,
                    selectedValue,
                    selectedType,
                    selectedIds,
                    this[selectedType + "Data"][unescape(selectedValue)]
                );
                this.referenceIds = {};
                this.referenceId = "";
                this.nbValuesSelected = 0;
            }
        } else {
            this.replaceValue(
                false,
                selectedValue,
                selectedType,
                selectedIds,
                this[selectedType + "Data"][unescape(selectedValue)]
            ); // And we update the newly selected value
        }

        this.nbValuesSelected++;
        this.referenceIds[selectedType] = selectedIds;
        this.updateUI(selectedType);

        if (!this.sizeSelected.value) {
            // Reset .js-sizes default value to "Choose size" to allow the user to choose an other size and not get stuck
            // on a single size when it's the only one available
            $(".js-sizes").val("default");
        }
    },
    replaceValue: function(reset, value, type, ids, options) {
        // If reset is true, we loop through the types to reset
        if (reset) {
            for (var type in this.types) {
                this[type + "Selected"] = { type: "", value: "", id: "" };
            }
            // Otherwise we assign the values to the proper type
        } else this[type + "Selected"] = { type: type, value: value, id: ids, options: options };
    },
    checkIfIdFitsAndGetIt: function(refId, idsToCheck) {
        var properId = "";

        idsToCheck.some(function(id) {
            // If we check the first value selected against the second value selected
            if (typeof refId === "object") {
                for (var type in refId) {
                    if (refId[type].indexOf(String(id)) >= 0) {
                        properId = id;
                        return true;
                    }
                }

                // If we check the first value selected against the third value selected
            } else {
                if (id === refId) {
                    properId = id;
                    return true;
                }
            }
        });
        return properId;
    },
    // Guess which types of data weren't selected
    guessTypes: function(refType) {
        var secondAndThirdTypes = [];
        switch (refType) {
            case "color":
                secondAndThirdTypes.push(this.types.trim, this.types.size);
                break;
            case "size":
                secondAndThirdTypes.push(this.types.color, this.types.trim);
                break;
            case "trim":
                secondAndThirdTypes.push(this.types.color, this.types.size);
                break;
        }
        return secondAndThirdTypes;
    },
    guessSelectedValue: function() {
        if (this.sizeSelected.value) return this.sizeSelected;
        if (this.colorSelected.value) return this.colorSelected;
        if (this.trimSelected.value) return this.trimSelected;
    },
    updateUI: function(selectedType) {
        function activate(node) {
            $(node)
                .removeClass("selected inactive")
                .addClass("active")
                .attr("disabled", false);
        }

        function deactivate(node) {
            $(node)
                .removeClass("selected active")
                .addClass("inactive")
                .attr("disabled", true);
        }

        function select(node) {
            $(node)
                .removeClass("active inactive")
                .addClass("selected");
        }

        for (var type in this.types) {
            // We loop through each node of the selected type
            $(".js-" + type + "s")
                .children()
                .each(
                    function(index, node) {
                        // If it's the first option of the <select> for sizes, we exit
                        if (node.getAttribute("selected")) return;
                        var nodeIds = node.getAttribute("id").split(",");
                        var nodeValue = node.getAttribute("data-color")
                            ? node.getAttribute("data-color")
                            : node.getAttribute("data-name") ? node.getAttribute("data-name") : unescape($(node).val());

                        if (nodeValue === this[type + "Selected"].value) {
                            select(node);
                        } else {
                            var isValid = 0;
                            for (var typeIdsArr in this.referenceIds) {
                                if (typeIdsArr !== type) {
                                    this.referenceIds[typeIdsArr].some(function(id, index) {
                                        if (nodeIds.indexOf(id) >= 0) isValid++;
                                    });
                                }
                            }

                            if (
                                (this.nbValuesSelected === 1 && (type === selectedType || isValid)) ||
                                (this.nbValuesSelected === 2 &&
                                    ((this[type + "Selected"].value && isValid) || isValid >= 2))
                            )
                                activate(node);
                            else deactivate(node);
                        }
                    }.bind(this)
                );
        }

        // We Update the showcase of selected values and switch the button
        this.updateSelection();
    },
    switchButton: function() {
        if (this.buttonClicked) this.errorHandling();
        this.errorHandlingInventorySearch();
        if (this.nbValueMax > 0) {
            if (this.nbValuesSelected === this.nbValueMax) {
                var itemIds = { color: this.colorSelected.id, size: this.sizeSelected.id, trim: this.trimSelected.id };

                var skuId = this.referenceId;
                if (!skuId) {
                    for (var type in this.types) {
                        if (this["Selected"].value) {
                            skuId = this["Selected"].id;
                        }
                    }
                }

                this.makeAjaxCallsForSkuId(skuId);
                this.updateWriteAReviewUrl(skuId);
            } else {
                // $('.add-to-cart-btn').attr('disabled', 'disabled').addClass('secondary').removeClass('primary');
                $("#confirm-button").attr("disabled", "disabled");
            }
        }
    },
    updateWriteAReviewUrl: function(skuId) {
        var url = $(".power-reviews-write-a-review-button a").attr("href");
        var modifiedUrl;
        if (null != url) {
            modifiedUrl = global[namespace].utilities.addURLParameter(url, "variant", skuId);
            if (modifiedUrl != undefined) {
                $(".power-reviews-write-a-review-button a").attr("href", modifiedUrl);
            }
        }
    },
    makeAjaxCallsForSkuId: function(skuId) {
        $("span.error").hide();
        $("#confirm-button").removeAttr("disabled");
        // $('.add-to-cart-btn').addClass('primary').removeClass('secondary').removeAttr("disabled");
        $(".add-to-cart-btn")
            .closest("form")
            .find(":input#updateItemId")
            .val(skuId);
        $("input[name=skuId]").val(skuId);
        $.ajax({
            url: "/browse/json/svcSkuSuccess.jsp?skuId=" + skuId,
            dataType: "json",
            type: "POST",
            async: false,
            success: function(responseText) {
                if (responseText.forSaleOnline === "true") {
                    if (responseText.inStockOnline === "true") {
                        $("#out-stock-wrapper").hide();
                        $("#in-stock-wrapper").show();
                    } else {
                        $("#in-stock-wrapper").hide();
                        $("#out-stock-wrapper").show();
                    }
                    $(".sdf-deliveryinfo").show();
                    $(".sdf-shippinginfo").show();
                } else {
                    $("#in-stock-wrapper").hide();
                    $("#out-stock-wrapper").hide();
                    $(".sdf-deliveryinfo").hide();
                    $(".sdf-shippinginfo").hide();
                }
                if (responseText.forSaleInStore === "true") {
                    if (responseText.forSaleOnline === "true") {
                        $(".product-wishlist-edgecase").hide();
                    } else {
                        $(".product-wishlist-edgecase").show();
                    }
                    $(".store-inventory-block").show();
                } else {
                    $(".store-inventory-block").hide();
                }

                if (responseText.isStockLimited === "true") {
                    $(".in-stock-limited").hide();
                } else {
                    $(".in-stock").show();
                }

                var productId = $('input[name="productId"]').val();
                $.ajax({
                    url: "/browse/ajax/svcAddToWishlistChangeSuccess.jsp?skuId=" + skuId + "&productId=" + productId,
                    dataType: "html",
                    type: "POST",
                    async: true,
                    success: function(responseText) {
                        $(".add-to-wishlist-btn").replaceWith(responseText);
                        $(".add-to-list-btn").removeClass("disable");
                    }
                });
            }
        });
        $.ajax({
            url: "/browse/ajax/svcSkuPriceChangeSuccess.jsp?skuId=" + skuId,
            dataType: "html",
            type: "POST",
            async: true,
            success: function(responseText) {
                //We need to retain the Star Ratings of Power Reviews even if Price change success happens.
                //Hence will be readd the DOM from current page.
                var ratingsDom = $(".product-ratings");
                $("div.product-title-and-price").replaceWith(responseText);
                $("div.product-title-and-price").append(ratingsDom);

                //We need this to reinitialize the accordion clicks
                // click on the promo link should open the promotion detail accordion
                $(".promotion").on("click", function(e) {
                    e.preventDefault();
                    var $accordion = $("#tab1");
                    $("html, body")
                        .stop()
                        .animate(
                            {
                                scrollTop: $accordion.offset().top
                            },
                            function() {
                                $accordion.focus();
                                if ($accordion.attr("aria-expanded") !== "true") {
                                    $accordion.trigger({
                                        type: "keydown",
                                        which: 13
                                    });
                                }
                            }
                        );
                });

                $("#pdpAccordion").accordion();
            }
        });
        $.ajax({
            url: "/browse/ajax/svcSkuAccordionChangeSuccess.jsp?skuId=" + skuId,
            dataType: "html",
            type: "POST",
            async: true,
            success: function(responseText) {
                //Code to change the accordions except for "Promotion Details"
                $("div#pdpNonPromoAccordions").replaceWith(responseText);
                $("#pdpNonPromoAccordions").accordion();

                //Code to change the "Promotion Details" Accordion when
                //there are different promotions for different skus
                if ($("#promotion-" + skuId).length) {
                    $("#svc-promotion-accordian").css("display", "block");
                    $("#svc-promotion-accordian")
                        .find(".accordion-body-content")
                        .css("display", "none");
                    $("#promotion-" + skuId).css("display", "block");
                } else {
                    $("#svc-promotion-accordian").css("display", "none");
                }
            }
        });
        $.ajax({
            url: "/browse/ajax/svcSkuImagesChangeSuccess.jsp?skuId=" + skuId,
            dataType: "html",
            type: "POST",
            async: true,
            success: function(responseText) {
                $("div.product-image-viewer").replaceWith(responseText);
                $("[data-imageviewer]").imageviewer();
            }
        });
        $.ajax({
            url: "/browse/ajax/svcSkuDescChangeSuccess.jsp?skuId=" + skuId,
            dataType: "html",
            type: "POST",
            async: true,
            success: function(responseText) {
                $("div#short-desc-sku-num").replaceWith(responseText);
            }
        });
        var productId = $(".store-inventory-block").attr("data-productId");
        $.ajax({
            url: "/browse/json/svcSkuDigitalData.jsp?productId=" + productId + "&skuId=" + skuId,
            dataType: "json",
            type: "POST",
            async: true,
            success: function(responseText) {
                if (
                    typeof digitalData !== undefined &&
                    typeof digitalData.product[0] !== undefined &&
                    typeof digitalData.product[0].productInfo !== undefined
                ) {
                    digitalData.product[0].productInfo.parentID = responseText.parentId;
                    digitalData.product[0].productInfo.productID = "p" + responseText.skuId;
                    digitalData.product[0].productInfo.prodID = responseText.skuId;
                    digitalData.product[0].productInfo.skuTrim = responseText.skuTrim;
                    digitalData.product[0].productInfo.skuSize = responseText.skuSize;
                    digitalData.product[0].productInfo.colorSizeTrimPosition = responseText.colorSizeTrim;
                    digitalData.product[0].productInfo.skuColor = responseText.skuColor;
                    digitalData.product[0].productInfo.skuId = responseText.skuId;
                    digitalData.product[0].productInfo.productTrims = responseText.productTrims;
                    digitalData.product[0].productInfo.productColors = responseText.productColors;
                    digitalData.product[0].productInfo.productSizes = responseText.productSizes;
                    digitalData.product[0].productInfo.productName = responseText.skuName;
                }
            }
        });
        $.ajax({
            url: "/browse/json/getInventorySearchText.jsp",
            dataType: "json",
            type: "GET",
            async: true,
            success: function(responseText) {
                var searchTextPresent = responseText.searchTextPresent;
                if (searchTextPresent === "true") {
                    var searchText = responseText.searchText;
                    $productInventoryFormAvailBlock.find("input[name=skuId]").val(skuId);
                    $productInventoryFormAvailBlock.find("input[name=searchText]").val(searchText);
                    $productInventoryFormAvailBlock
                        .validate({ submit_validate: false })
                        .ajaxSubmit(productInventoryFormOptions2);
                }
            }
        });
    },
    updateSelection: function() {
        var listToCount = [
            { className: ".js-sizes", type: "sizes" },
            { className: ".js-trims", type: "trims" },
            { className: ".js-colors", type: "colors" }
        ];
        var selectedItems = $(".selected-item");

        listToCount.forEach(
            function(value) {
                var optionsCount = 0;

                $(value.className)
                    .children()
                    .each(function(index, node) {
                        // Dynamic count of available options
                        // if (!$(node).hasClass('inactive') && !node.getAttribute('selected')) optionsCount++;

                        // Static count of options
                        if (!node.getAttribute("selected")) optionsCount++;
                    });
                this.nbAvailableOptions[value.type] = optionsCount;
            }.bind(this)
        );

        selectedItems.empty();

        for (var type in this.types) {
            if (this.nbAvailableOptions[type + "s"] > 0) {
                // Display the "Selected" values
                var string1 =
                    type +
                    " : " +
                    (this[type + "Selected"].value
                        ? this[type + "Selected"].value +
                          " | Ids : " +
                          (this.referenceId ? this.referenceId : this[type + "Selected"].id.toString())
                        : "none");
                selectedItems.append($("<li></li>").text(string1));

                // Displays the number of options next to the title and the selected value if there is one
                if (this[type + "Selected"].value) {
                    var string2;
                    if (type === "color") {
                        string2 =
                            type +
                            " (" +
                            this.nbAvailableOptions[type + "s"] +
                            "):<span> " +
                            this["DisplayValues"][this["Selected"].value][0] +
                            "</span>";
                    } else {
                        if (productVariance.sellType === "0") {
                            string2 =
                                
                                unescape(this[type + "Selected"].value) +
                                "</span>";
                        } else if (productVariance.sellType === "2") {
                            string2 =
                                "Choose A Box Spring " +
                                type +
                                " (" +
                                this.nbAvailableOptions[type + "s"] +
                                "):<span> " +
                                unescape(this["Selected"].value) +
                                "</span>";
                        } else {
                            string2 =
                                
                                unescape(this[type + "Selected"].value) +
                                "</span>";
                        }
                    }
                    $("#" + type + "s-title").html(string2);
                } else {
                    if (productVariance.sellType === "0") {
                        var string3 =  type + " ";
                    } else if (productVariance.sellType === "2") {
                        var string3 = "Choose A Box Spring " + type + " (" + this.nbAvailableOptions[type + "s"] + ")";
                    } else {
                        var string3 = type + " ";
                    }
                    $("#" + type + "s-title").html(string3);
                }
            } else {
                $("#" + type + "s-container").addClass("invisible");
            }
        }

        this.switchButton();
    },
    displayColorsAndSizesAndTrims: function() {
        // Displays the choices for Colors

        Object.keys(this.colorData).forEach(
            function(key) {
                var colorList = document.querySelector(".js-colors");
                var colorItem = document.createElement("li");
                var colorSpan = document.createElement("span");

                colorItem.setAttribute("id", this.getItemIds(this.colorData[key]));
                colorItem.setAttribute("data-color", key);
                if (this.colorDisplayValues[key][1].charAt(0) === "#") {
                    var color = this.colorDisplayValues[key][1];
                } else var color = "#" + this.colorDisplayValues[key][1];

                var image = this.colorDisplayValues[key][2];

                // Sets ids for each element

                if (color.length > 1) {
                    colorItem.setAttribute("data-bgColor", color);
                    colorSpan.style.backgroundColor = color;
                } else {
                    colorItem.setAttribute("data-image", image);
                    colorSpan.style.backgroundImage = "url(" + image + ")";
                }

                colorItem.appendChild(colorSpan);
                colorList.appendChild(colorItem);

                this.nbAvailableOptions.color++;
            }.bind(this)
        );

        //Displays the choices for Trims

        Object.keys(this.trimData).forEach(
            function(key) {
                var trimList = document.querySelector(".js-trims");
                var trimItem = document.createElement("li");
                var trimSpan = document.createElement("span");

                // Sets ids for each element
                trimItem.setAttribute("id", this.getItemIds(this.trimData[key]));
                trimItem.setAttribute("data-name", key);

                if (this.trimDisplayValues[key][1].charAt(0) === "#") {
                    var color = this.trimDisplayValues[key][1];
                } else var color = "#" + this.trimDisplayValues[key][1];

                var image = this.trimDisplayValues[key][2];
                if (color.length > 1) {
                    trimItem.setAttribute("data-bgColor", color);
                    trimSpan.style.backgroundColor = color;
                } else {
                    trimItem.setAttribute("data-image", image);
                    trimSpan.style.backgroundImage = "url(" + image + ")";
                }

                trimSpan.style.backgroundColor = this.trimDisplayValues[key][1];
                //trimSpan.innerText = key;
                trimItem.appendChild(trimSpan);
                trimList.appendChild(trimItem);
                this.nbAvailableOptions.trim++;
            }.bind(this)
        );

        // Display the choices for Sizes

        if (productVariance.sellType === "0" || productVariance.sellType === "2") {
            Object.keys(this.sizeData).forEach(
                function(key) {
                    var sizeItem = document.createElement("li");
                    var sizeList = document.querySelector(".js-sizes");
                    var sizeSpan = document.createElement("span");

                    // Sets ids for each element
                    sizeItem.setAttribute("id", this.getItemIds(this.sizeData[key]));
                    sizeItem.setAttribute("data-boxspring", this.sizeData[key][0][3]);
                    sizeItem.setAttribute("data-boxspringskuid", this.sizeData[key][0][4]);
                    sizeItem.setAttribute("data-name", key);

                    sizeItem.innerText = key;
                    // sizeItem.value = escape(key);

                    sizeList.appendChild(sizeItem);
                    this.nbAvailableOptions.size++;
                }.bind(this)
            );
        }
    },
    errorHandling: function() {
        var valuesNotSelected = [];

        // Error handling
        // -------------------------------------
        // If the number of values exepected is smaller than the number of values selected
        if (this.nbValueMax > this.nbValuesSelected) {
            // We loop through the types of values
            for (var type in this.types) {
                // If this type of value has options it means it can be selected
                if (this.nbAvailableOptions[type + "s"] > 0) {
                    // If this type doesn't have any value selected
                    if (!this[type + "Selected"].value) {
                        // We display a message next to the title of this particular type of value
                        $("#" + type + "s-container .error")[0].textContent = 
                        valuesNotSelected.push(type);
                    } else {
                        // Otherwise we empty the message
                        $("#" + type + "s-container .error")[0].textContent = "";
                    }
                }
            }

            var errorRecap = $("#errormessageWrapper .errormessage")[0];

            if (valuesNotSelected.length === 3) {
                errorRecap.textContent =
                    "Oops. Please make a color, size, and trim selection before adding this item to your shopping cart";
            } else if (valuesNotSelected.length === 2) {
                errorRecap.textContent =
                    "Oops. Please make a " +
                    valuesNotSelected[0] +
                    " and " +
                    valuesNotSelected[1] +
                    " selection before adding this item to your shopping cart";
            } else if (valuesNotSelected.length === 1) {
                errorRecap.textContent =
                    "Oops. Please make a " +
                    valuesNotSelected[0] +
                    " selection before adding this item to your shopping cart";
            }
        } else {
            $(".error").each(function(index, node) {
                $(node)[0].textContent = "";
            });
            $(".errormessage").each(function(index, node) {
                $("#errormessageWrapper").css("display", "none");
                $(node)[0].textContent = "";
            });
        }
    },
    errorHandlingInventorySearch: function() {
        var valuesNotSelected = [];

        // Error handling
        // -------------------------------------
        // If the number of values exepected is smaller than the number of values selected
        if (this.nbValueMax > this.nbValuesSelected) {
            // We loop through the types of values
            for (var type in this.types) {
                // If this type of value has options it means it can be selected
                if (this.nbAvailableOptions[type + "s"] > 0) {
                    // If this type doesn't have any value selected
                    if (!this[type + "Selected"].value) {
                        // We display a message next to the title of this particular type of value
                        $("#" + type + "s-container .error")[0].textContent = 
                        valuesNotSelected.push(type);
                    } else {
                        // Otherwise we empty the message
                        $("#" + type + "s-container .error")[0].textContent = "";
                    }
                }
            }

            var errorRecap = $("#errormessageWrapper .errormessage")[0];

            if (valuesNotSelected.length === 3) {
                errorRecap.textContent =
                    "Oops. Please make a color, size, and trim selection before finding store Inventory";
            } else if (valuesNotSelected.length === 2) {
                errorRecap.textContent =
                    "Oops. Please make a " +
                    valuesNotSelected[0] +
                    " and " +
                    valuesNotSelected[1] +
                    " selection before finding store Inventory";
            } else if (valuesNotSelected.length === 1) {
                errorRecap.textContent =
                    "Oops. Please make a " + valuesNotSelected[0] + " selection before finding store Inventory";
            }
        } else {
            $(".error").each(function(index, node) {
                $(node)[0].textContent = "";
            });
            $(".errormessage").each(function(index, node) {
                $("#errormessageWrapper").css("display", "none");
                $(node)[0].textContent = "";
            });
        }
    },

    getItemIds: function(dataObject) {
        var ids = null;
        for (var property in dataObject) {
            if (ids !== null) ids += "," + dataObject[property][2];
            else ids = dataObject[property][2];
        }
        return ids;
    },
    getUrlParameter: function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    init: function(productVariance) {
        for (var type in this.types) {
            if (productVariance[type + "Json"].length > 10) this.nbValueMax++;
        }
        this.colorDisplayValues = JSON.parse(productVariance.colorDataJson);
        this.trimDisplayValues = JSON.parse(productVariance.trimDataJson);

        this.colorData = JSON.parse(productVariance.colorJson);
        this.sizeData = JSON.parse(productVariance.sizeJson);
        this.trimData = JSON.parse(productVariance.trimJson);

        //Data variables to determine if only one option is present for the variance
        var colorDataLength = Object.keys(this.colorDisplayValues).length;
        var trimDataLength = Object.keys(this.trimDisplayValues).length;
        var sizeDataLength = Object.keys(this.sizeData).length;
        //A total with less than equal 3 means that the we have to directly find the sku
        //and Jennifer will not have selection option
        var totalNumOfOptions = 0;

        // //These checks will help to find if there is only one selection
        // //If it is only one option for Jennifer, dont show the option to her
        if (colorDataLength === 1) {
            for (key in this.colorData) {
                skuId = this.colorData[key][0][2];
            }
            this.colorData = {};
            this.nbValueMax--;
            if (trimDataLength < 2 && sizeDataLength < 2) this.totalNumOfOptions++;
        }

        if (trimDataLength === 1) {
            for (key in this.trimData) {
                skuId = this.trimData[key][0][2];
            }
            this.trimData = {};
            this.nbValueMax--;
            if (colorDataLength < 2 && sizeDataLength < 2) this.totalNumOfOptions++;
        }

        if (sizeDataLength === 1) {
            for (key in this.sizeData) {
                skuId = this.sizeData[key][0][2];
            }
            this.sizeData = {};
            this.nbValueMax--;
            if (colorDataLength < 2 && trimDataLength < 2) this.totalNumOfOptions++;
        }

        this.displayColorsAndSizesAndTrims();

        var selector = this;

        $("ul.js-colors, ul.js-trims").on("click", "li", function(event) {
            var selectedType,
                selectedValue,
                selectedIds = this.getAttribute("id").split(",");

            if (this.getAttribute("data-color") !== null) {
                selectedValue = String(this.getAttribute("data-color"));
                selectedType = selector.types.color;
            } else {
                selectedValue = String(this.getAttribute("data-name"));
                selectedType = selector.types.trim;
            }
            selector.updateSelectedItems(selectedType, selectedValue, selectedIds);
        });
        $("ul.js-sizes").on("click", "li", function(event) {
            var selectedType,
                selectedValue,
                selectedIds = this.getAttribute("id").split(","),
                selectedMoney = this.getAttribute("data-boxspring");

            if (this.getAttribute("data-color") !== null) {
                selectedValue = String(this.getAttribute("data-color"));
                selectedType = selector.types.color;
            } else {
                selectedValue = String(this.getAttribute("data-name"));
                selectedType = selector.types.size;
            }
            console.log("selectedType", selectedType, "selectedValue", selectedValue, "selectedIds", selectedIds);
            selector.addSpringBox(selectedMoney);
            selector.updateSelectedItems(selectedType, selectedValue, selectedIds);
        });
        $("select.js-sizes").change(function(event) {
            var selectedType = selector.types.size;
            var selectedValue = String($(this).val());
            if (selectedValue === "default") return;

            var selectedIds = $('.js-sizes option[value="' + selectedValue + '"]')
                .attr("id")
                .split(",");

            selector.updateSelectedItems(selectedType, selectedValue, selectedIds);
        });
        $("#addtocart-button").click(
            function() {
                if (!this.buttonClicked) this.buttonClicked = true;
                $("#errormessageWrapper").show();
                this.errorHandling();
                if (digitalData.page.attributes.userMessage != undefined) {
                    digitalData.page.attributes.userMessage += $("#errormessageWrapper").text();
                } else {
                    digitalData.page.attributes.userMessage = $("#errormessageWrapper").text();
                }
            }.bind(this)
        );
        $(".store-search").click(
            function(event) {
                if (this.nbValuesSelected !== this.nbValueMax) {
                    event.preventDefault();
                    $("#errormessageWrapper").show();
                    this.errorHandlingInventorySearch();
                    if (digitalData.page.attributes.userMessage != undefined) {
                        digitalData.page.attributes.userMessage += $("#errormessageWrapper").text();
                    } else {
                        digitalData.page.attributes.userMessage = $("#errormessageWrapper").text();
                    }
                } else {
                    $("#errormessageWrapper").hide();
                }
            }.bind(this)
        );

        // We store the query parameters in an object
        var queryParameters = {
            color: this.getUrlParameter("color"),
            size: this.getUrlParameter("size"),
            trim: this.getUrlParameter("trim"),
            id: this.getUrlParameter("skuId")
        };

        if (queryParameters.id.length > 0) {
            var refId = queryParameters.id;

            $(".js-trims li").each(function(index, node) {
                var ids = node.getAttribute("id").split(",");
                var selectedValue = String(this.getAttribute("data-name"));
                var selectedType = selector.types.trim;

                if (ids.indexOf(refId) >= 0) {
                    selector.updateSelectedItems(selectedType, selectedValue, ids);
                }
            });

            $(".js-colors li").each(function(index, node) {
                var ids = node.getAttribute("id").split(",");
                var selectedValue = String(this.getAttribute("data-color"));
                var selectedType = selector.types.color;

                if (ids.indexOf(refId) >= 0) {
                    selector.updateSelectedItems(selectedType, selectedValue, ids);
                }
            });
            //                            $('.js-sizes li').each(function (index, node) {
            //                                var ids = node.getAttribute('id').split(',');
            //                                var selectedValue = String(this.getAttribute('data-name'));
            //                                var selectedType = selector.types.size;

            //                                if (ids.indexOf(refId) >= 0) {
            //                                    selector.updateSelectedItems(selectedType, selectedValue, ids);
            //                                }
            //                            });

            $(".js-sizes option").each(function(index, node) {
                if (index !== 0) {
                    var ids = node.getAttribute("id").split(",");
                    var selectedValue = String($(this).val());
                    var selectedType = selector.types.size;

                    if (ids.indexOf(refId) >= 0) {
                        $(".js-sizes").val(selectedValue);
                        selector.updateSelectedItems(selectedType, selectedValue, ids);
                    }
                }
            });
        } else {
            // We loop through the properties
            for (var key in queryParameters) {
                var queryValue = queryParameters[key];

                // If the property contains some value there is a corresponding query parameter
                if (queryValue) {
                    var dataObject = this[key + "Data"][queryValue];

                    // If data is stored for this value
                    if (dataObject || (key === "color" || "trim")) {
                        if ((key === "color" || "trim") && !dataObject) {
                            for (var name in this[key + "Data"]) {
                                this[key + "DisplayValues"][name].some(
                                    function(array) {
                                        if (array.indexOf(queryValue || "#" + queryValue) >= 0) {
                                            dataObject = this[key + "Data"][name];
                                            queryValue = name;
                                            return true;
                                        }
                                    }.bind(this)
                                );
                            }
                        }

                        if (key === "size") $(".js-sizes").val(queryValue);

                        if (dataObject) {
                            // We get all the ids available for this value
                            var ids = this.getItemIds(dataObject).split(",");
                            // We update the selection
                            this.updateSelectedItems(key, queryValue, ids);
                        }
                    }
                }
            }
        }
        this.updateSelection();

        //It seems that there is no selection for Jennifer hence directly show the
        //the components from SKU
        if (totalNumOfOptions > 0 && totalNumOfOptions <= 3 && skuId) {
            this.makeAjaxCallsForSkuId(skuId);
        }
    }
};

var productVariance = {
    colorDataJson: "{}",
    colorJson: "{}",
    sizeJson:
        '{"S":[["","","810164817","11.00","81078612"]],"M":[["","","810164818","15.00","81078613"]],"L":[["","","810164819","17.50","81078614"]]}',
    trimDataJson: "{}",
    trimJson: "{}",
    sellType: "0"
};
colorSizeTrimSelector.init(productVariance);
