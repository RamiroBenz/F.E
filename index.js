numFilasImpuestos = 6;
        numFilasImpuestosMax = 6;

        function ajustarAnchoFocus(campo) {
            campo.style.width = (campo.value.length > 36) ? "280px" : (campo.value.length > 26) ? "240px" : "200px";
            // Con style="overflow:visible;" IE cambia el tamaÃ±o de forma automÃ¡tica, por lo que esto no es necesario - correcciÃ³n, obviamente tiene un bug y me arruina el ancho!
            //if (!(navigator.userAgent.indexOf("MSIE")>=0))
            {
                if ((campo.value.length > 36) || (campo.value.indexOf("\n") >= 0))
                    ajustarFilas(campo, Math.min(estimarNumLineas(campo.value, 40), 5));
                else
                    ajustarFilas(campo, 1);
            }
        }

        function ajustarAnchoBlur(campo) {
            campo.style.width = (campo.value.length > 46) ? "340px" : (campo.value.length > 36) ? "280px" : (campo.value.length > 26) ? "220px" : (campo.value.length > 16) ? "180px" : "120px";
        }

        function insertarFilaDetalle() {
            if (numFilasDetalles >= 9) {
                alert("Por favor ingrese no mas de 9 lineas de detalle.");
                return;
            }

            indiceDetalles[numFilasDetallesMax] = numFilasDetalles + 1;
            var tbl = document.getElementById('idoperacion');
            var lastRow = tbl.rows.length;
            var r = tbl.insertRow(lastRow);
            var c = new Array();

            for (var i = 0; i < 12; i++) {
                c[i] = r.insertCell(i);
                c[i].setAttribute("style", "padding:0px 4px;");
            }

            numFilasDetalles++;
            numFilasDetallesMax++;

            c[0].innerHTML = "<input type='text' name='detalleCodigoArticulo' maxlength='9' /><input type='hidden' name='detalleNroLinea' />";
            c[1].innerHTML = "<textarea name='detalleDescripcion' id='detalle_descripcion" + numFilasDetallesMax + "' style='width:400px;overflow:auto;" + (navigator.userAgent.indexOf("Firefox") ? "height:19px;" : "") + "' rows='1' onFocus='ajustarAnchoFocus(this);' onKeyPress='return limitarLongitudTextArea(event,this,4000);' onKeyUp='ajustarAnchoFocus(this);' onBlur='ajustarAnchoBlur(this);'></textarea>"; // Si, Firefox tiene un bug horrible: no puede hacer textareas con una sola fila, por eso tengo que simularla con el height:19px;
            c[2].innerHTML = "<input type='text' name='detalleCantidad' maxlength='19' id='detalle_cantidad" + numFilasDetallesMax + "' onkeyup='calcularSubtotalDetalle(" + numFilasDetallesMax + ");' onchange='calcularSubtotalDetalle(" + numFilasDetallesMax + ");' value='1' />";
            c[3].innerHTML = "<select type='text' name='detalleMedida' id='detalle_medida" + numFilasDetallesMax + "' style='width:95px;'><option value='7' style='color:#888;'>Unidades</option>" + htmlUnidadesMedida + "</select>";
            c[4].innerHTML = "<input type='text' name='detallePrecio' maxlength='19' id='detalle_precio" + numFilasDetallesMax + "' onkeyup='calcularSubtotalDetalle(" + numFilasDetallesMax + ");' onchange='calcularSubtotalDetalle(" + numFilasDetallesMax + ");' />"; //TODO: agregar autocomplete='off' para que los navegadores no guarden el historial de datos numÃ©ricos, sÃ³lo permitirlo en cÃ³digo y descripciÃ³n. Por ahora lo dejo para que funcione el history.back() ya que con autocomplete='off' borra el valor al volver a la pÃ¡gina
            c[5].innerHTML = "<input type='text' name='detalleSubtotal1' id='detalle_subtotal1" + numFilasDetallesMax + "' readonly='readonly' />";
            c[6].innerHTML = "<select name='detalleTipoIVA' id='detalle_tipo_iva" + numFilasDetallesMax + "' onchange='calcularSubtotalDetalle(" + numFilasDetallesMax + ");' style='width:70px;'> <option value='0' style='color:#888;'>seleccionar...</option><option value='1'>&nbsp;No gravado</option><option value='2'>&nbsp;Exento</option><option value='3'>&nbsp;0%</option><option value='9'>&nbsp;2,5%</option><option value='8'>&nbsp;5%</option><option value='4'>&nbsp;10,5%</option><option value='5' selected='selected'>&nbsp;21%</option><option value='6'>&nbsp;27%</option></select>";
            c[7].innerHTML = "<input type='text' name='detalleImporteIVA' id='detalle_importe_iva" + numFilasDetallesMax + "' readonly='readonly' />";
            c[8].innerHTML = "<input type='text' name='detalleSubtotal2' id='detalle_subtotal2" + numFilasDetallesMax + "' readonly='readonly' />";
            c[9].innerHTML = "<span style='width:100%;text-align:center;'><input type='button' name='Eliminar' value='X' style='width:31px;text-align:center;color:#fff;background-color:#7d0505;border-radius:5px;font-size:10px;' onclick='borrarFilaDetalle(" + numFilasDetallesMax + ");' /></span>";
            c[10].setAttribute("style", "text-align:center;padding:0px;");
        }

        function calcularImporteBonificacionDetalle(fila) {
            var cantidad = document.getElementById('detalle_cantidad' + fila).value * 1;
            var precio = document.getElementById('detalle_precio' + fila).value;
            document.getElementById('detalle_porcentaje' + fila).style.color = "#000000";
            document.getElementById('detalle_tipo_bonificacion' + fila).value = "porcentaje";

            if (cantidad.toFixed)
                document.getElementById('detalle_importe_bonificacion' + fila).value =
                    (precio * cantidad * document.getElementById('detalle_porcentaje' + fila).value / 100.0).toFixed(2);
            else
                document.getElementById('detalle_importe_bonificacion' + fila).value =
                    precio * cantidad * document.getElementById('detalle_porcentaje' + fila).value / 100.0;

            document.getElementById('detalle_importe_bonificacion' + fila).style.color = "#999999";
            calcularSubtotalDetalle(fila);
        }

        function calcularPorcentajeBonificacionDetalle(fila) {
            var cantidad = document.getElementById('detalle_cantidad' + fila).value * 1;
            var precio = document.getElementById('detalle_precio' + fila).value;
            document.getElementById('detalle_importe_bonificacion' + fila).style.color = "#000000";
            document.getElementById('detalle_tipo_bonificacion' + fila).value = "importe";
            var importeBon = document.getElementById('detalle_importe_bonificacion' + fila).value * 100;

            if (cantidad.toFixed)
                document.getElementById('detalle_porcentaje' + fila).value = (importeBon / (precio * cantidad)).toFixed(2);
            else
                document.getElementById('detalle_porcentaje' + fila).value = importeBon / (precio * cantidad);

            document.getElementById('detalle_porcentaje' + fila).style.color = "#999999";
            calcularSubtotalDetalle(fila);
        }

        function calcularSubtotalDetalle(fila) {
            if (cambioManualDetalle) {
                cambioManualDetalle = false;
                var cantidad = document.getElementById('detalle_cantidad' + fila).value * 1;
                var precio = document.getElementById('detalle_precio' + fila).value * 1;
                var subTotalNeto = precio * cantidad;

                var importeBon = document.getElementById('detalle_importe_bonificacion' + fila).value * 1;
                var subtotal1 = subTotalNeto - importeBon;

                var tipoIVA = document.getElementById('detalle_tipo_iva' + fila).value;
                if (isNaN(tipoIVA)) tipoIVA = 0;

                var importeIVA = 0;
                if (tipoIVA == 4)
                    importeIVA = subtotal1 * 0.105;
                else if (tipoIVA == 5)
                    importeIVA = subtotal1 * 0.21;
                else if (tipoIVA == 6)
                    importeIVA = subtotal1 * 0.27;
                else if (tipoIVA == 8)
                    importeIVA = subtotal1 * 0.05;
                else if (tipoIVA == 9)
                    importeIVA = subtotal1 * 0.025;

                if (subtotal1.toFixed) {
                    document.getElementById('detalle_subtotal1' + fila).value = subtotal1.toFixed(2);
                    document.getElementById('detalle_importe_iva' + fila).value = importeIVA.toFixed(2);
                    document.getElementById('detalle_subtotal2' + fila).value = (subTotalNeto - importeBon + importeIVA).toFixed(2);
                } else {
                    document.getElementById('detalle_subtotal1' + fila).value = subtotal1;
                    document.getElementById('detalle_importe_iva' + fila).value = importeIVA;
                    document.getElementById('detalle_subtotal2' + fila).value = subTotalNeto - importeBon + importeIVA;
                }

                calcularTotal();
                cambioManualDetalle = true;
            }
        }

        function calcularTotal() {
            var tbl = document.getElementById('idoperacion');
            var numFilas = tbl.rows.length;
            var fila;
            var totalNetoNoGravado = 0;
            var totalExento = 0;
            var totalNetoGravado = 0;
            var totalIVA27 = 0;
            var totalIVA21 = 0;
            var totalIVA105 = 0;
            var totalIVA5 = 0;
            var totalIVA2 = 0;
            var totalImpuestos = document.getElementById('imptotalimpuestos2').value * 1;
            var total = 0;
            var totalPesos = 0;

            for (var i = 1; i < numFilasDetalles + 1; i++) {
                fila = tbl.rows[i];
                if (fila.cells[8].firstChild.value == "1")
                    totalNetoNoGravado += fila.cells[7].firstChild.value * 1;
                else if (fila.cells[8].firstChild.value == "2")
                    totalExento += fila.cells[7].firstChild.value * 1;
                else if (fila.cells[8].firstChild.value == "3")
                    totalNetoGravado += fila.cells[7].firstChild.value * 1;
                else if (fila.cells[8].firstChild.value == "4") {
                    totalIVA105 += fila.cells[9].firstChild.value * 1;
                    totalNetoGravado += fila.cells[7].firstChild.value * 1;
                }
                else if (fila.cells[8].firstChild.value == "5") {
                    totalIVA21 += fila.cells[9].firstChild.value * 1;
                    totalNetoGravado += fila.cells[7].firstChild.value * 1;
                }
                else if (fila.cells[8].firstChild.value == "6") {
                    totalIVA27 += fila.cells[9].firstChild.value * 1;
                    totalNetoGravado += fila.cells[7].firstChild.value * 1;
                }
                else if (fila.cells[8].firstChild.value == "8") {
                    totalIVA5 += fila.cells[9].firstChild.value * 1;
                    totalNetoGravado += fila.cells[7].firstChild.value * 1;
                }
                else if (fila.cells[8].firstChild.value == "9") {
                    totalIVA2 += fila.cells[9].firstChild.value * 1;
                    totalNetoGravado += fila.cells[7].firstChild.value * 1;
                }
                total += fila.cells[10].firstChild.value * 1;
            }

            if (totalNetoNoGravado.toFixed) {
                document.getElementById("impnetonogravado").value = totalNetoNoGravado.toFixed(2);
                document.getElementById("impexento").value = totalExento.toFixed(2);
                document.getElementById("impnetogravado").value = totalNetoGravado.toFixed(2);
                //recalcularBonificacionForzado();
                document.getElementById("impiva27").value = totalIVA27.toFixed(2);
                document.getElementById("impiva21").value = totalIVA21.toFixed(2);
                document.getElementById("impiva105").value = totalIVA105.toFixed(2);
                document.getElementById("impiva5").value = totalIVA5.toFixed(2);
                document.getElementById("impiva2").value = totalIVA2.toFixed(2);
                //document.getElementById("creditoiva").value = ((totalIVA27+totalIVA21+totalIVA105)*document.getElementById('porcbonifglobal').value/100.0).toFixed(2);
                document.getElementById("imptotal").value = (total/*-valorImporteBonifGlobal*/ + totalImpuestos).toFixed(2);
                if (simboloMoneda != "$") {
                    totalPesos = (document.getElementById("imptotal").value * 1) * tipoCambio;
                    document.getElementById("imptotalpesos").value = totalPesos.toFixed(2);
                }
            }

            else {
                document.getElementById("impnetonogravado").value = totalNetoNoGravado;
                document.getElementById("impexento").value = totalExento;
                document.getElementById("impnetogravado").value = totalNetoGravado;
                document.getElementById("impiva27").value = totalIVA27;
                document.getElementById("impiva21").value = totalIVA21;
                document.getElementById("impiva105").value = totalIVA105;
                document.getElementById("impiva5").value = totalIVA5;
                document.getElementById("impiva2").value = totalIVA2;

                document.getElementById("imptotal").value = total/*-valorImporteBonifGlobal*/ + totalImpuestos;
                if (simboloMoneda != "$") {
                    totalPesos = (document.getElementById("imptotal").value * 1) * tipoCambio;
                    document.getElementById("imptotalpesos").value = totalPesos.toFixed(2);
                }
            }
        }

        function insertarFilaImpuesto() {
            if (numFilasImpuestos >= 9) {
                alert("Por favor ingrese no mÃ¡s de 3 tributos adicionales.");
                return;
            }
            indiceImpuestos[numFilasImpuestosMax] = numFilasImpuestos + 1;
            var tbl = document.getElementById("impuestos");
            var lastRow = tbl.rows.length;
            var r = tbl.insertRow(lastRow - ((simboloMoneda == "$") ? 2 : 3));
            var c = new Array();

            for (var i = 0; i < 6; i++)
                c[i] = r.insertCell(i);

            numFilasImpuestos++;
            numFilasImpuestosMax++;
            c[0].innerHTML = "<input type='text' name='impuestoDescripcion' id='impuesto_descripcion" + numFilasImpuestosMax + "' style='width:130px;' maxlength='40' />"
                + "<input type='hidden' name='impuestoCodigo' id='impuesto_codigo" + numFilasImpuestosMax + "' value='0' />";
            c[0].setAttribute("style", "text-align:right;padding:0px;");
            c[1].innerHTML = "<input type='text' name='impuestoDetalle' id='impuesto_detalle" + numFilasImpuestosMax + "' onkeyup='calcularTotalImpuestos();' style='width:100px;' maxlength='25' />";
            c[1].setAttribute("style", "padding:0px;");
            c[1].style.padding = "0px";
            c[2].innerHTML = "<input type='text' name='impuestoBaseImponible' id='impuesto_baseimponible" + numFilasImpuestosMax + "' onkeyup='calcularImporteFilaImpuestos(" + numFilasImpuestosMax + ");' onchange='calcularImporteFilaImpuestos(" + numFilasImpuestosMax + ");' style='width:70px;' />";
            c[2].setAttribute("style", "padding:0px;");
            c[2].style.padding = "0px";
            c[3].innerHTML = "<input type='text' name='impuestoAlicuota' id='impuesto_alicuota" + numFilasImpuestosMax + "' onkeyup='calcularImporteFilaImpuestos(" + numFilasImpuestosMax + ");' onchange='calcularImporteFilaImpuestos(" + numFilasImpuestosMax + ");' style='width:45px;' />";
            c[3].setAttribute("style", "padding:0px;");
            c[3].style.padding = "0px";
            c[4].innerHTML = "<span>" + simboloMoneda + "</span>&nbsp;<input type='text' name='impuestoMonto' onkeyup='calcularTotalImpuestos();' id='impuesto_monto" + numFilasImpuestosMax + "' onchange='limpiarBIyAFilaImpuestos(" + numFilasImpuestosMax + ");' style='width:70px;' />";
            c[4].setAttribute("style", "padding:0px;");
            c[4].style.padding = "0px";
            c[5].innerHTML = "<span style='width:100%;text-align:center;'><input type='button' name='Eliminar' id='ef' value='X' style='width:31px;text-align:center;color:#FF0000;font-size:10px;' onclick='borrarFilaImpuesto(" + numFilasImpuestosMax + ");' /></span>";
            c[5].setAttribute("style", "padding:0px;");
            c[5].style.padding = "0px";
        }

        var estadoBorrandoDetalle = false;
        var progresoBorrandoDetalle = 0;

        function borrarFilaDetalle(rowNum) {
            if (!estadoBorrandoDetalle) {
                estadoBorrandoDetalle = true;
                var fila = document.getElementById('idoperacion').rows[indiceDetalles[rowNum - 1]];

                for (i = 0; i < 10; i++)
                    fila.cells[i].firstChild.style.border = "none";
                fila.cells[3].firstChild.style.display = "none";
                fila.cells[8].firstChild.style.display = "none";
                fila.cells[11].firstChild.style.display = "none";

                borrarFilaDetalleTimer(rowNum);
            }
        }

        function borrarFilaDetalleTimer(rowNum) {
            if (progresoBorrandoDetalle == 10) {
                progresoBorrandoDetalle = 0;
                tableRemoveRow('idoperacion', indiceDetalles[rowNum - 1]);
                numFilasDetalles--;

                for (i = rowNum - 1; i < numFilasDetallesMax; i++)
                    indiceDetalles[i]--;

                calcularTotalImpuestos();
                calcularTotal();
                estadoBorrandoDetalle = false;
            }
            else {
                progresoBorrandoDetalle += 2;
                var fila = document.getElementById('idoperacion').rows[indiceDetalles[rowNum - 1]];
                fila.style.height = (11 - progresoBorrandoDetalle) + "px";

                for (i = 0; i < 11; i++)
                    fila.cells[i].firstChild.style.fontSize = (11 - progresoBorrandoDetalle) + "px";

                setTimeout("borrarFilaDetalleTimer(" + rowNum + ")", 15);
            }
        }

        var estadoBorrandoImpuesto = false;
        var progresoBorrandoImpuesto = 0;

        function borrarFilaImpuesto(rowNum) {
            if (!estadoBorrandoImpuesto) {
                estadoBorrandoImpuesto = true;
                var fila = document.getElementById('impuestos').rows[indiceImpuestos[rowNum - 1]];

                fila.cells[4].style.textAlign = 'right';
                fila.cells[4].firstChild.style.display = 'none';
                fila.cells[5].firstChild.style.display = "none";

                borrarFilaImpuestoTimer(rowNum);
            }
        }

        function borrarFilaImpuestoTimer(rowNum) {
            if (progresoBorrandoImpuesto == 10) {
                progresoBorrandoImpuesto = 0;
                tableRemoveRow('impuestos', indiceImpuestos[rowNum - 1]);
                numFilasImpuestos--;

                for (i = rowNum - 1; i < numFilasImpuestosMax; i++)
                    indiceImpuestos[i]--;

                if (numFilasImpuestos == 6)
                    document.getElementById('labelotrosimpuestos').style.display = 'none';

                calcularTotalImpuestos();
                calcularTotal();
                estadoBorrandoImpuesto = false;
            }
            else {
                progresoBorrandoImpuesto += 2;
                var fila = document.getElementById('impuestos').rows[indiceImpuestos[rowNum - 1]];
                fila.style.height = (11 - progresoBorrandoImpuesto) + "px";

                fila.cells[0].firstChild.style.fontSize = (11 - progresoBorrandoImpuesto) + "px";
                fila.cells[1].firstChild.style.fontSize = (11 - progresoBorrandoImpuesto) + "px";
                fila.cells[2].firstChild.style.fontSize = (11 - progresoBorrandoImpuesto) + "px";
                fila.cells[3].firstChild.style.fontSize = (11 - progresoBorrandoImpuesto) + "px";
                fila.cells[4].getElementsByTagName("input")[0].style.fontSize = (11 - progresoBorrandoImpuesto) + "px";
                setTimeout("borrarFilaImpuestoTimer(" + rowNum + ")", 15);
            }
        }

        function validarCampos() {
            if (validarCamposObligatorios())
                if (validarCamposValores())
                    if (validarCamposLongitudCombinadaDescripciones())
                        document.datosOperacionForm.submit();
        }

        function validarCamposObligatorios() {
            var i;
            var fila = 1;
            var camposFaltantes = "";
            var camposFaltantesFila;
            var totalFilasConCamposFaltantes = 0;

            for (i = 1; i <= numFilasDetallesMax; i++) {
                if (document.getElementById("detalle_descripcion" + i)) {
                    camposFaltantesFila = registrarSiVacio("detalle_descripcion" + i, "DescripciÃ³n Producto/Servicio (fila " + fila + ")");
                    camposFaltantesFila += registrarSiVacio("detalle_cantidad" + i, "Cantidad (fila " + fila + ")");
                    camposFaltantesFila += registrarSiVacio("detalle_precio" + i, "Precio Unitario (fila " + fila + ")");
                    camposFaltantesFila += registrarSiNulo("detalle_tipo_iva" + i, 0, "AlÃ­cuota IVA (fila " + fila + ")");
                    if (camposFaltantesFila != "") {
                        totalFilasConCamposFaltantes++;
                        if (totalFilasConCamposFaltantes < 6)
                            camposFaltantes += camposFaltantesFila;
                    }
                    fila++;
                }
            }
            if (totalFilasConCamposFaltantes >= 6)
                camposFaltantes += "* [...]";

            if (camposFaltantes == "")
                return true;
            else {
                alert("Los siguientes campos son obligatorios:\n\n" + camposFaltantes);
                return false;
            }
        }

        function validarCamposValores() {
            var i;
            var fila;
            var camposInvalidos = "";
            var camposInvalidosFila;
            var totalFilasConCamposInvalidos = 0;
            var numDecimalesCantidad = document.getElementById("numdecimalescantidad") ? document.getElementById("numdecimalescantidad").value : 2;
            var numDecimalesPrecioUnit = document.getElementById("numdecimalespreciounit") ? document.getElementById("numdecimalespreciounit").value : 2;

            fila = 1;
            for (i = 1; i <= numFilasDetallesMax; i++) {
                if (document.getElementById("detalle_descripcion" + i)) {
                    camposInvalidosFila = validarCampoNumericoConDecimales("detalle_cantidad" + i, (numDecimalesCantidad < 6) ? 7 : 5, numDecimalesCantidad, "Cantidad (fila " + fila + ")");
                    camposInvalidosFila += validarCampoNumericoConDecimales("detalle_precio" + i, (numDecimalesPrecioUnit < 6) ? 11 : 9, numDecimalesPrecioUnit, "Precio Unitario (fila " + fila + ")");
                    camposInvalidosFila += validarPorcentaje("detalle_porcentaje" + i, 3, 2, "% BonificaciÃ³n (fila " + fila + ")");
                    camposInvalidosFila += validarCampoNumericoConDecimales("detalle_importe_bonificacion" + i, 11, 2, "Importe BonificaciÃ³n (fila " + fila + ")");
                    camposInvalidosFila += validarCampoNumericoConDecimales("detalle_subtotal2" + i, 11, 2, "Subtotal [modificar cantidad y/o precio] (fila " + fila + ")");
                    if (camposInvalidosFila != "") {
                        totalFilasConCamposInvalidos++;
                        if (totalFilasConCamposInvalidos < 6)
                            camposInvalidos += camposInvalidosFila;
                    }
                    fila++;
                }
            }

            fila = 1;
            for (i = 1; i <= numFilasImpuestosMax; i++) {
                if (document.getElementById("impuesto_monto" + i)) {
                    camposInvalidosFila = validarCampoNumericoConDecimales("impuesto_baseimponible" + i, 11, 2,
                        "Base Imponible (Tributos - fila " + fila + ")");
                    camposInvalidosFila += validarPorcentaje("impuesto_alicuota" + i, 3, 2,
                        "% AlÃ­cuota (Tributos - fila " + fila + ")");
                    camposInvalidosFila += validarCampoNumericoConDecimales("impuesto_monto" + i, 11, 2,
                        "Monto (Tributos - fila " + fila + ")");
                    if (camposInvalidosFila != "") {
                        totalFilasConCamposInvalidos++;
                        if (totalFilasConCamposInvalidos < 6)
                            camposInvalidos += camposInvalidosFila;
                    }
                    fila++;
                }
            }

            if (totalFilasConCamposInvalidos >= 6)
                camposInvalidos += "* [...]";

            if (camposInvalidos == "")
                return true;
            else {
                alert("Los siguientes campos tienen valores incorrectos:\n\n" + camposInvalidos);
                return false;
            }
        }

        function validarCamposLongitudCombinadaDescripciones() {
            var i;
            var fila;
            var longitudTotal = 0;

            fila = 1;
            for (i = 1; i <= numFilasDetallesMax; i++) {
                if (document.getElementById("detalle_descripcion" + i))
                    longitudTotal += document.getElementById("detalle_descripcion" + i).value.length * 1;
            }

            return true;
        }


        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (elt /*, from*/) {
                var len = this.length >>> 0;

                var from = Number(arguments[1]) || 0;
                from = (from < 0)
                    ? Math.ceil(from)
                    : Math.floor(from);
                if (from < 0)
                    from += len;

                for (; from < len; from++) {
                    if (from in this &&
                        this[from] === elt)
                        return from;
                }
                return -1;
            };
        }

        function tableRemoveRow(tableId, rowNum) {
            var tbl = document.getElementById(tableId);
            try {
                tbl.deleteRow(rowNum);
            }
            catch (ex) {
            }
        }

        function registrarSiVacio(campo, descripcionError) {
            if (document.getElementById(campo).value == "") {
                document.getElementById(campo).className = "jig_error";
                return "* " + descripcionError + "\n";
            }
            else {
                if (document.getElementById(campo).readOnly)
                    document.getElementById(campo).className = "jig_readonly";
                else
                    document.getElementById(campo).className = "";
                return "";
            }
        }

        function registrarSiNulo(campo, valorNulo, descripcionError) {
            if (document.getElementById(campo).value == valorNulo) {
                document.getElementById(campo).className = "jig_error";
                return "* " + descripcionError + "\n";
            }
            else {
                document.getElementById(campo).className = "";
                return "";
            }
        }

        function validarPorcentaje(campo, enteros, decimales, descripcionError) {
            var descripcionErrorNumerico = validarCampoNumericoConDecimales(campo, enteros, decimales, descripcionError)
            if (descripcionErrorNumerico.length > 0)
                return descripcionErrorNumerico;

            valorCampo = document.getElementById(campo).value;
            if (valorCampo.length == 0) {
                if (document.getElementById(campo).readOnly)
                    document.getElementById(campo).className = "jig_readonly";
                else
                    document.getElementById(campo).className = "";

                return "";
            }

            if (valorCampo * 1 < 0) {
                document.getElementById(campo).className = "jig_error";
                return "* " + descripcionError + " (el valor debe ser mayor o igual a cero)\n";
            }
            else if (valorCampo * 1 > 100) {
                document.getElementById(campo).className = "jig_error";
                return "* " + descripcionError + " (el valor debe ser menor o igual a 100)\n";
            }

            if (document.getElementById(campo).readOnly)
                document.getElementById(campo).className = "jig_readonly";
            else
                document.getElementById(campo).className = "";

            return "";
        }

        function validarCampoNumericoConDecimales(campo, enteros, decimales, descripcionError) {
            valorCampo = document.getElementById(campo).value;
            if (valorCampo.length == 0) {
                if (document.getElementById(campo).readOnly)
                    document.getElementById(campo).className = "jig_readonly";
                else
                    document.getElementById(campo).className = "";
                return "";
            }
            if (!validarNumericoConDecimales(valorCampo, enteros, decimales)) {
                document.getElementById(campo).className = "jig_error";
                return "* " + descripcionError + " (el valor debe ser numÃ©rico, positivo, con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
            }
            if (document.getElementById(campo).readOnly)
                document.getElementById(campo).className = "jig_readonly";
            else
                document.getElementById(campo).className = "";
            return "";
        }

        function validarCampoNumericoConSignoConDecimales(campo, enteros, decimales, descripcionError) {
            valorCampo = document.getElementById(campo).value;
            if (valorCampo.length == 0) {
                if (document.getElementById(campo).readOnly)
                    document.getElementById(campo).className = "jig_readonly";
                else
                    document.getElementById(campo).className = "";
                return "";
            }
            if (!validarNumericoConSignoConDecimales(valorCampo, enteros, decimales)) {
                document.getElementById(campo).className = "jig_error";
                return "* " + descripcionError + " (el valor debe ser numÃ©rico, con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
            }
            if (document.getElementById(campo).readOnly)
                document.getElementById(campo).className = "jig_readonly";
            else
                document.getElementById(campo).className = "";
            return "";
        }

        function validarCampoImporte(campo, codigoUnidad, enteros, decimales, descripcionError) {
            valorCampo = document.getElementById(campo).value;
            if (valorCampo.length == 0) {
                if (document.getElementById(campo).readOnly)
                    document.getElementById(campo).className = "jig_readonly";
                else
                    document.getElementById(campo).className = "";
                return "";
            }

            if (codigoUnidad == 97) {
                if (!validarNumericoConSignoConDecimales(valorCampo, enteros, decimales)) {
                    document.getElementById(campo).className = "jig_error";
                    return "* " + descripcionError + " (el valor debe ser numÃ©rico, con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
                }
            }
            else if (codigoUnidad == 99) {
                if (!validarNumericoConSignoConDecimales(valorCampo, enteros, decimales)) {
                    document.getElementById(campo).className = "jig_error";
                    return "* " + descripcionError + " (el valor debe ser numÃ©rico, con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
                }
                else if (valorCampo * 1 >= 0) {
                    document.getElementById(campo).className = "jig_error";
                    return "* " + descripcionError + " (el valor debe ser numÃ©rico, negativo -por tratarse de un descuento- con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
                }
            }
            else if (codigoUnidad == 95) {
                if (!validarNumericoConSignoConDecimales(valorCampo, enteros, decimales)) {
                    document.getElementById(campo).className = "jig_error";
                    return "* " + descripcionError + " (el valor debe ser numÃ©rico, con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
                }
                else if (valorCampo * 1 > 0) {
                    document.getElementById(campo).className = "jig_error";
                    return "* " + descripcionError + " (el valor debe ser numÃ©rico menor o igual a cero -por tratarse de una anulaciÃ³n- con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
                }
            }
            else {
                if (!validarNumericoConDecimales(valorCampo, enteros, decimales)) {
                    document.getElementById(campo).className = "jig_error";
                    return "* " + descripcionError + " (el valor debe ser numÃ©rico, positivo, con 1 a " + enteros + " enteros y hasta " + decimales + " decimales)\n";
                }
            }

            if (document.getElementById(campo).readOnly)
                document.getElementById(campo).className = "jig_readonly";
            else
                document.getElementById(campo).className = "";

            return "";
        }

        function validarNumericoConDecimales(texto, enteros, decimales) {
            var regExp = new RegExp("^\\d{1," + enteros + "}(\\.\\d{0," + decimales + "}?)?$");

            return (texto.match(regExp));
            /*if (texto.match(regExp))
                alert("Si, "+texto+" tiene 1 a "+enteros+" enteros y 0 a "+decimales+" decimales!");
            else
                alert("No, "+texto+" no tiene 1 a "+enteros+" enteros o 0 a "+decimales+" decimales");*/
        }

        // Nota: acepto negativos con signo, pero los positivos tienen que ser sin signo (+5.50 serÃ­a invÃ¡lido, por ejemplo)
        function validarNumericoConSignoConDecimales(texto, enteros, decimales) {
            var regExp = new RegExp("^-?\\d{1," + enteros + "}(\\.\\d{0," + decimales + "}?)?$");

            return (texto.match(regExp));
        }

        function validarCampoNumericoSinDecimales(campo, enteros, descripcionError) {
            valorCampo = document.getElementById(campo).value;
            if (valorCampo.length == 0) {
                if (document.getElementById(campo).readOnly)
                    document.getElementById(campo).className = "jig_readonly";
                else
                    document.getElementById(campo).className = "";
                return "";
            }
            if (!validarNumericoSinDecimales(valorCampo, enteros)) {
                document.getElementById(campo).className = "jig_error";
                return "* " + descripcionError + " (el valor debe ser numÃ©rico, con un mÃ¡ximo de " + enteros + " dÃ­gitos)\n";
            }
            if (document.getElementById(campo).readOnly)
                document.getElementById(campo).className = "jig_readonly";
            else
                document.getElementById(campo).className = "";
            return "";
        }

        function validarNumericoSinDecimales(texto, enteros) {
            var regExp = new RegExp("^\\d{1," + enteros + "}$");

            return (texto.match(regExp));
            /*if (texto.match(regExp))
                alert("Si, "+texto+" tiene 1 a "+enteros+" enteros y 0 a "+decimales+" decimales!");
            else
                alert("No, "+texto+" no tiene 1 a "+enteros+" enteros o 0 a "+decimales+" decimales");*/
        }

        function habilitarDesabilitar(elem, idElem) {
            if (elem.checked) {
                document.getElementById(idElem).disabled = "";
                document.getElementById(idElem).className = "";
            } else {
                document.getElementById(idElem).disabled = "disabled";
                document.getElementById(idElem).className = "jig_readonly";
                document.getElementById(idElem).value = "";
            }
        }

        function estimarNumLineas(texto, anchoLinea) {
            var numLineas = 0;
            var lineas = texto.split('\n');
            if (lineas.length == 0)
                numLineas += Math.ceil(texto.length / anchoLinea);
            else {
                for (j = 0; j < lineas.length; j++)
                    numLineas += Math.ceil(lineas[j].length / anchoLinea);
            }
            return numLineas;
        }

        function anchoIncluyendoFinesDeLinea(texto) {
            return texto.length + texto.split('\n').length - 1;
        }

        function recortar(objeto, caracteres) {
            if (anchoIncluyendoFinesDeLinea(objeto.value) > caracteres)
                objeto.value = objeto.value.substring(0, caracteres - objeto.value.split('\n').length + 1);
        }

        function ajustarFilas(campo, filas) {
            campo.setAttribute("rows", filas);

            if (filas == 4)
                campo.style.height = "100px";

            // IE y Safari no tienen el bug de Firefox que impide mostrar un textbox con rows = 1 (siempre muestra 2 como mÃ­nimo)
            //if (navigator.userAgent.indexOf("Firefox")>=0)
            {
                if (filas == 1)
                    campo.style.height = "19px";
                else
                    campo.style.height = "auto";
            }
        }

        function limitarLongitudTextArea(e, campo, longitud) {
            var kcode = (window.event) ? window.event.keyCode : e.which;
            if ((kcode > 36 && kcode < 41) || kcode == 8 || kcode == 0)
                return true;
            else
                return (anchoIncluyendoFinesDeLinea(campo.value) < longitud);
        }

        /*****************************************/
        var cambioManualDetalle = true;
        var cambioManualDetalleImpuestos = true;
        var indiceDetalles = new Array();
        var indiceImpuestos = new Array();

        var numFilasDetalles = 0;
        var numFilasDetallesMax = 0;
        var numFilasImpuestos = 0;
        var numFilasImpuestosMax = 0;
        /*****************************************/

        function calcularImporteFilaImpuestos(fila) {
            if (cambioManualDetalleImpuestos) {
                cambioManualDetalleImpuestos = false;
                var baseImponible = document.getElementById('impuesto_baseimponible' + fila).value * 1;
                var alicuota = document.getElementById('impuesto_alicuota' + fila).value * 1;
                var importe = baseImponible * alicuota / 100;

                if (importe.toFixed)
                    document.getElementById('impuesto_monto' + fila).value = importe.toFixed(2);
                else
                    document.getElementById('impuesto_monto' + fila).value = importe;

                calcularTotalImpuestos();
                cambioManualDetalleImpuestos = true;
            }
        }

        function limpiarBIyAFilaImpuestos(fila) {
            if (cambioManualDetalleImpuestos) {
                cambioManualDetalleImpuestos = false;
                document.getElementById('impuesto_baseimponible' + fila).value = "";
                document.getElementById('impuesto_alicuota' + fila).value = "";
                calcularTotalImpuestos();
                cambioManualDetalleImpuestos = true;
            }
        }

        function calcularTotalImpuestos() {
            var tbl = document.getElementById('impuestos');
            var numFilas = tbl.rows.length;
            var fila;
            var total = 0;
            for (var i = 0; i < numFilas; i++) {
                fila = tbl.rows[i];

                if (fila.cells.length >= 5)
                    if (fila.cells[4].childNodes.length >= 2)
                        total += fila.cells[4].childNodes[2].value * 1;
            }

            if (total.toFixed) {
                document.getElementById("imptotalimpuestos1").value = total.toFixed(2);
                document.getElementById("imptotalimpuestos2").value = total.toFixed(2);
            }
            else {
                document.getElementById("imptotalimpuestos1").value = total;
                document.getElementById("imptotalimpuestos2").value = total;
            }

            calcularTotal();
        }





        /*
**************Session activa***********************
*/


        function ajaxMantenerSesionActiva() {
            var xmlHttp;
            try { // Safari, Firefox, Opera, etc.
                xmlHttp = new XMLHttpRequest();
            }
            catch (e) { // Internet Explorer
                try {
                    xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch (e) {
                    try {
                        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    catch (e) {
                        alert("El browser utilizado no soporta AJAX!");
                        return false;
                    }
                }
            }
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4) {
                    var resultado = xmlHttp.responseText;
                    var componentesResultado = resultado.split("#%#");
                    var estado = componentesResultado[0];
                    if (estado != "OK") {
                        if (estado == "ERROR")
                            alert(componentesResultado[1]);
                        else
                            alert("La sesiÃ³n ha expirado, por favor vuelva a ingresar al sistema.");
                    }
                }
            }
            xmlHttp.open("GET", "ajax.do?f=keepalive&r=" + Math.random(), true);
            xmlHttp.send(null);
        }





    </script>



    <script>
        function salirAplicacion(context) {
            if (confirm("Â¿Desea salir de la aplicacion?")) {
                var xmlHttp;
                try { // Safari, Firefox, Opera, etc.
                    xmlHttp = new XMLHttpRequest();
                } catch (E) { // Internet Explorer
                    try {
                        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
                    } catch (E) {
                        try {
                            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                        } catch (E) {
                            alert("El browser utilizado no soporta AJAX!");
                            return false;
                        }
                    }
                }

                try {
                    xmlHttp.open("GET", context + "/jsp/logout.do", true);
                    xmlHttp.send(null);
                    if (xmlHttp.readyState == 4) { // Complete
                        if (xmlHttp.status == 200) { // OK response
                        } else {
                            alert("Problem: " + req.statusText);
                        }
                    }
                } catch (Ex) {
                    alert("Error");
                }

                $('body').parent().css("background-image", "none");
                if (!($.browser.msie && ($.browser.version < 9)))
                    $('body').html(''); // Como en IE < 9 uso PIE en el css, genera errores si trato de ejecutar esta linea, asÃ­ que sÃ³lo la corro si no es IE o si es IE >= 9
                window.opener = self;
                window.close();
                //setTimeout('alert("Su navegador impide cerrar la ventana automÃ¡ticamente. Por favor proceda a cerrarla de forma manual.")',3000);
                setTimeout('document.location.href = "index.php";', 3000);
            }
        }
