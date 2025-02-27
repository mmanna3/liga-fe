//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v14.0.3.0 (NJsonSchema v11.0.0.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

export class Client {
    private http: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> };
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) {
        this.http = http ? http : window as any;
        this.baseUrl = baseUrl ?? "";
    }

    /**
     * @return Success
     */
    clubAll(): Promise<ClubDTO[]> {
        let url_ = this.baseUrl + "/api/Club";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processClubAll(_response);
        });
    }

    protected processClubAll(response: Response): Promise<ClubDTO[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            if (Array.isArray(resultData200)) {
                result200 = [] as any;
                for (let item of resultData200)
                    result200!.push(ClubDTO.fromJS(item));
            }
            else {
                result200 = <any>null;
            }
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<ClubDTO[]>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    clubPOST(body: ClubDTO | undefined): Promise<ClubDTO> {
        let url_ = this.baseUrl + "/api/Club";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processClubPOST(_response);
        });
    }

    protected processClubPOST(response: Response): Promise<ClubDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = ClubDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<ClubDTO>(null as any);
    }

    /**
     * @return Success
     */
    clubGET(id: number): Promise<ClubDTO> {
        let url_ = this.baseUrl + "/api/Club/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processClubGET(_response);
        });
    }

    protected processClubGET(response: Response): Promise<ClubDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = ClubDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<ClubDTO>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    clubPUT(id: number, body: ClubDTO | undefined): Promise<void> {
        let url_ = this.baseUrl + "/api/Club/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processClubPUT(_response);
        });
    }

    protected processClubPUT(response: Response): Promise<void> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            return;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<void>(null as any);
    }

    /**
     * @return Success
     */
    delegadoAll(): Promise<DelegadoDTO[]> {
        let url_ = this.baseUrl + "/api/Delegado";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processDelegadoAll(_response);
        });
    }

    protected processDelegadoAll(response: Response): Promise<DelegadoDTO[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            if (Array.isArray(resultData200)) {
                result200 = [] as any;
                for (let item of resultData200)
                    result200!.push(DelegadoDTO.fromJS(item));
            }
            else {
                result200 = <any>null;
            }
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<DelegadoDTO[]>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    delegadoPOST(body: DelegadoDTO | undefined): Promise<DelegadoDTO> {
        let url_ = this.baseUrl + "/api/Delegado";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processDelegadoPOST(_response);
        });
    }

    protected processDelegadoPOST(response: Response): Promise<DelegadoDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = DelegadoDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<DelegadoDTO>(null as any);
    }

    /**
     * @return Success
     */
    delegadoGET(id: number): Promise<DelegadoDTO> {
        let url_ = this.baseUrl + "/api/Delegado/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processDelegadoGET(_response);
        });
    }

    protected processDelegadoGET(response: Response): Promise<DelegadoDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = DelegadoDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<DelegadoDTO>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    delegadoPUT(id: number, body: DelegadoDTO | undefined): Promise<void> {
        let url_ = this.baseUrl + "/api/Delegado/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processDelegadoPUT(_response);
        });
    }

    protected processDelegadoPUT(response: Response): Promise<void> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            return;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<void>(null as any);
    }

    /**
     * @return Success
     */
    equipoAll(): Promise<EquipoDTO[]> {
        let url_ = this.baseUrl + "/api/Equipo";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processEquipoAll(_response);
        });
    }

    protected processEquipoAll(response: Response): Promise<EquipoDTO[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            if (Array.isArray(resultData200)) {
                result200 = [] as any;
                for (let item of resultData200)
                    result200!.push(EquipoDTO.fromJS(item));
            }
            else {
                result200 = <any>null;
            }
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<EquipoDTO[]>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    equipoPOST(body: EquipoDTO | undefined): Promise<EquipoDTO> {
        let url_ = this.baseUrl + "/api/Equipo";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processEquipoPOST(_response);
        });
    }

    protected processEquipoPOST(response: Response): Promise<EquipoDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = EquipoDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<EquipoDTO>(null as any);
    }

    /**
     * @return Success
     */
    equipoGET(id: number): Promise<EquipoDTO> {
        let url_ = this.baseUrl + "/api/Equipo/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processEquipoGET(_response);
        });
    }

    protected processEquipoGET(response: Response): Promise<EquipoDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = EquipoDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<EquipoDTO>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    equipoPUT(id: number, body: EquipoDTO | undefined): Promise<void> {
        let url_ = this.baseUrl + "/api/Equipo/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processEquipoPUT(_response);
        });
    }

    protected processEquipoPUT(response: Response): Promise<void> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            return;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<void>(null as any);
    }

    /**
     * @return Success
     */
    jugadorAll(): Promise<JugadorDTO[]> {
        let url_ = this.baseUrl + "/api/Jugador";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processJugadorAll(_response);
        });
    }

    protected processJugadorAll(response: Response): Promise<JugadorDTO[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            if (Array.isArray(resultData200)) {
                result200 = [] as any;
                for (let item of resultData200)
                    result200!.push(JugadorDTO.fromJS(item));
            }
            else {
                result200 = <any>null;
            }
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<JugadorDTO[]>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    jugadorPOST(body: JugadorDTO | undefined): Promise<JugadorDTO> {
        let url_ = this.baseUrl + "/api/Jugador";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processJugadorPOST(_response);
        });
    }

    protected processJugadorPOST(response: Response): Promise<JugadorDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = JugadorDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<JugadorDTO>(null as any);
    }

    /**
     * @return Success
     */
    jugadorGET(id: number): Promise<JugadorDTO> {
        let url_ = this.baseUrl + "/api/Jugador/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processJugadorGET(_response);
        });
    }

    protected processJugadorGET(response: Response): Promise<JugadorDTO> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = JugadorDTO.fromJS(resultData200);
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<JugadorDTO>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    jugadorPUT(id: number, body: JugadorDTO | undefined): Promise<void> {
        let url_ = this.baseUrl + "/api/Jugador/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processJugadorPUT(_response);
        });
    }

    protected processJugadorPUT(response: Response): Promise<void> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            return;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<void>(null as any);
    }

    /**
     * @param dni (optional) 
     * @return Success
     */
    publico(dni: string | undefined): Promise<boolean> {
        let url_ = this.baseUrl + "/api/publico?";
        if (dni === null)
            throw new Error("The parameter 'dni' cannot be null.");
        else if (dni !== undefined)
            url_ += "dni=" + encodeURIComponent("" + dni) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "text/plain"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processPublico(_response);
        });
    }

    protected processPublico(response: Response): Promise<boolean> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = resultData200 !== undefined ? resultData200 : <any>null;
    
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<boolean>(null as any);
    }
}

export class ClubDTO implements IClubDTO {
    id?: number;
    nombre!: string;
    equipos?: EquipoDTO[] | undefined;

    constructor(data?: IClubDTO) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.nombre = _data["nombre"];
            if (Array.isArray(_data["equipos"])) {
                this.equipos = [] as any;
                for (let item of _data["equipos"])
                    this.equipos!.push(EquipoDTO.fromJS(item));
            }
        }
    }

    static fromJS(data: any): ClubDTO {
        data = typeof data === 'object' ? data : {};
        let result = new ClubDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["nombre"] = this.nombre;
        if (Array.isArray(this.equipos)) {
            data["equipos"] = [];
            for (let item of this.equipos)
                data["equipos"].push(item.toJSON());
        }
        return data;
    }
}

export interface IClubDTO {
    id?: number;
    nombre: string;
    equipos?: EquipoDTO[] | undefined;
}

export class DelegadoDTO implements IDelegadoDTO {
    id?: number;
    usuario?: string | undefined;
    nombre?: string | undefined;
    apellido?: string | undefined;
    password?: string | undefined;
    clubId?: number;

    constructor(data?: IDelegadoDTO) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.usuario = _data["usuario"];
            this.nombre = _data["nombre"];
            this.apellido = _data["apellido"];
            this.password = _data["password"];
            this.clubId = _data["clubId"];
        }
    }

    static fromJS(data: any): DelegadoDTO {
        data = typeof data === 'object' ? data : {};
        let result = new DelegadoDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["usuario"] = this.usuario;
        data["nombre"] = this.nombre;
        data["apellido"] = this.apellido;
        data["password"] = this.password;
        data["clubId"] = this.clubId;
        return data;
    }
}

export interface IDelegadoDTO {
    id?: number;
    usuario?: string | undefined;
    nombre?: string | undefined;
    apellido?: string | undefined;
    password?: string | undefined;
    clubId?: number;
}

export class EquipoDTO implements IEquipoDTO {
    id?: number;
    nombre?: string | undefined;
    clubId?: number;
    codigoAlfanumerico?: string | undefined;
    clubNombre?: string | undefined;
    jugadores?: JugadorDelEquipoDTO[] | undefined;

    constructor(data?: IEquipoDTO) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.nombre = _data["nombre"];
            this.clubId = _data["clubId"];
            this.codigoAlfanumerico = _data["codigoAlfanumerico"];
            this.clubNombre = _data["clubNombre"];
            if (Array.isArray(_data["jugadores"])) {
                this.jugadores = [] as any;
                for (let item of _data["jugadores"])
                    this.jugadores!.push(JugadorDelEquipoDTO.fromJS(item));
            }
        }
    }

    static fromJS(data: any): EquipoDTO {
        data = typeof data === 'object' ? data : {};
        let result = new EquipoDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["nombre"] = this.nombre;
        data["clubId"] = this.clubId;
        data["codigoAlfanumerico"] = this.codigoAlfanumerico;
        data["clubNombre"] = this.clubNombre;
        if (Array.isArray(this.jugadores)) {
            data["jugadores"] = [];
            for (let item of this.jugadores)
                data["jugadores"].push(item.toJSON());
        }
        return data;
    }
}

export interface IEquipoDTO {
    id?: number;
    nombre?: string | undefined;
    clubId?: number;
    codigoAlfanumerico?: string | undefined;
    clubNombre?: string | undefined;
    jugadores?: JugadorDelEquipoDTO[] | undefined;
}

export class EquipoDelJugadorDTO implements IEquipoDelJugadorDTO {
    id?: number;
    nombre?: string | undefined;
    club?: string | undefined;
    estado?: EstadoJugadorEnum;

    constructor(data?: IEquipoDelJugadorDTO) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.nombre = _data["nombre"];
            this.club = _data["club"];
            this.estado = _data["estado"];
        }
    }

    static fromJS(data: any): EquipoDelJugadorDTO {
        data = typeof data === 'object' ? data : {};
        let result = new EquipoDelJugadorDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["nombre"] = this.nombre;
        data["club"] = this.club;
        data["estado"] = this.estado;
        return data;
    }
}

export interface IEquipoDelJugadorDTO {
    id?: number;
    nombre?: string | undefined;
    club?: string | undefined;
    estado?: EstadoJugadorEnum;
}

export enum EstadoJugadorEnum {
    _1 = 1,
    _2 = 2,
    _3 = 3,
    _4 = 4,
    _5 = 5,
}

export class JugadorDTO implements IJugadorDTO {
    id?: number;
    dni!: string;
    nombre!: string;
    apellido!: string;
    fechaNacimiento!: Date;
    equipoInicialId?: number;
    equipos?: EquipoDelJugadorDTO[] | undefined;

    constructor(data?: IJugadorDTO) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.dni = _data["dni"];
            this.nombre = _data["nombre"];
            this.apellido = _data["apellido"];
            this.fechaNacimiento = _data["fechaNacimiento"] ? new Date(_data["fechaNacimiento"].toString()) : <any>undefined;
            this.equipoInicialId = _data["equipoInicialId"];
            if (Array.isArray(_data["equipos"])) {
                this.equipos = [] as any;
                for (let item of _data["equipos"])
                    this.equipos!.push(EquipoDelJugadorDTO.fromJS(item));
            }
        }
    }

    static fromJS(data: any): JugadorDTO {
        data = typeof data === 'object' ? data : {};
        let result = new JugadorDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["dni"] = this.dni;
        data["nombre"] = this.nombre;
        data["apellido"] = this.apellido;
        data["fechaNacimiento"] = this.fechaNacimiento ? this.fechaNacimiento.toISOString() : <any>undefined;
        data["equipoInicialId"] = this.equipoInicialId;
        if (Array.isArray(this.equipos)) {
            data["equipos"] = [];
            for (let item of this.equipos)
                data["equipos"].push(item.toJSON());
        }
        return data;
    }
}

export interface IJugadorDTO {
    id?: number;
    dni: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: Date;
    equipoInicialId?: number;
    equipos?: EquipoDelJugadorDTO[] | undefined;
}

export class JugadorDelEquipoDTO implements IJugadorDelEquipoDTO {
    id?: number;
    dni?: string | undefined;
    nombre?: string | undefined;
    apellido?: string | undefined;
    estado?: EstadoJugadorEnum;

    constructor(data?: IJugadorDelEquipoDTO) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.dni = _data["dni"];
            this.nombre = _data["nombre"];
            this.apellido = _data["apellido"];
            this.estado = _data["estado"];
        }
    }

    static fromJS(data: any): JugadorDelEquipoDTO {
        data = typeof data === 'object' ? data : {};
        let result = new JugadorDelEquipoDTO();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["dni"] = this.dni;
        data["nombre"] = this.nombre;
        data["apellido"] = this.apellido;
        data["estado"] = this.estado;
        return data;
    }
}

export interface IJugadorDelEquipoDTO {
    id?: number;
    dni?: string | undefined;
    nombre?: string | undefined;
    apellido?: string | undefined;
    estado?: EstadoJugadorEnum;
}

export class ApiException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new ApiException(message, status, response, headers, null);
}