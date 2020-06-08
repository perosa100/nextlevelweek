import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./styles.css";
import logo from "../../assets/logo.svg";
import { FiArrowLeft } from "react-icons/fi";
import { Link,useHistory } from "react-router-dom";
import api from "../../services/api";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";
// import { Container } from './styles';
import { Map, TileLayer, Marker} from "react-leaflet";
import DropZonee from '../../components/DropZonee'

//array ou objeto : manualmente informar o tipo da variavel

//interface representa a marcação das variaveis

interface Item {
  id: number;
  title: string;
  image_url: string;
}

/* interface UF{
  id:number,
  name:string
}
 */

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUf, setselectedUf] = useState<string>("0");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("0");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory()

  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);
  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);
        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === "0") {
      return;
    }
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);
        setCities(cityNames);
      });
  }, [selectedUf]);

  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setselectedUf(uf);
  }

  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectedItem(id:number){

   const alreadySelected=  selectedItems.findIndex(item=> item ===id)

   if(alreadySelected>=0){
    const filteredItems = selectedItems.filter(item=> item !== id)
    console.log(selectedItems)
    setSelectedItems(filteredItems)
   }else{
    setSelectedItems([...selectedItems,id])
    console.log(selectedItems)
   }
  }

  async function handleSubmit(event:FormEvent){
    event.preventDefault()

    console.log(selectedFile)

  

    const {name,email,whatsapp} = formData
    const uf = selectedUf
    const city= selectedCity
    const [latitude,longitude] = selectedPosition
    const items = selectedItems
   
    const data = new FormData()
      
   data.append('name',name)
   data.append('email',email)
   data.append('whatsapp',whatsapp)
   data.append('uf',uf)
   data.append('city',city)
   data.append('latitude',String(latitude))
   data.append('longitude',String(longitude))
   data.append('items',items.join(','))
 
  if(selectedFile){
    data.append('image',selectedFile)
  }
   await api.post('points',data)

   alert('Cadastro efetuado com sucesso')
console.log(data)
   history.push('/')
  }
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="" />
        <Link to="/">
          <FiArrowLeft />
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <DropZonee  onFileUploaded={setSelectedFile} />
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>


        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="name">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estados (UF)</label>
              <select
                onChange={handleSelectedUf}
                value={selectedUf}
                name="uf"
                id="uf"
              >
                <option value="0">Selecione um UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                onChange={handleSelectedCity}
                value={selectedCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Items de coleta</h2>
            <span>Selecione um ou mais pontos de coleta </span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li key={item.id} onClick={()=>handleSelectedItem(item.id)}
              className={selectedItems.includes(item.id)? 'selected': ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
