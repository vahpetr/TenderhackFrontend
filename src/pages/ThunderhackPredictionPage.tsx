import {
  useState,
  useEffect,
} from "react";
import {useParams} from "react-router-dom";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

interface ThunderhackCustomerPageRouteParams {
  type: string;
  inn: string;
  kpp: string;
}

interface Organization {
  id: number;
  name: string;
  inn: string;
  kpp: string;
}

interface Order {
  id: number;
  quantity: number;
  amount: number;
  productId: number | null;
}

interface ScoredOrder {
  order: Order;
  score: number;
}

interface Category {
  id: number;
  title: string;
  kpgz: string;
}

interface Product {
  id: number;
  name: string;
  category: Category;
}

const columns: GridColDef[] = [
  { field: 'productId', headerName: '№', width: 100 },
  { field: 'name', headerName: 'Наименование', width: 250 },
  { field: 'categoryTitle', headerName: 'Категория', width: 200 },
  { field: 'categoryKpgz', headerName: 'КПГЗ', width: 200 },
  { field: 'quantity', headerName: 'Количество', width: 200 },
  { field: 'amount', headerName: 'Цена', width: 150 },
];

const rowSelector = (p: Order, productsMap: {[key: number]: Product}) => {
  return {
    ...p,
    name: p.productId ? productsMap[p.productId].name : 'n/a',
    categoryTitle: p.productId ? productsMap[p.productId].category.title : 'n/a',
    categoryKpgz: p.productId ? productsMap[p.productId].category.kpgz : 'n/a'
  };
}


function ThunderhackProviderPage() {
  const { type, inn, kpp } = useParams<ThunderhackCustomerPageRouteParams>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [predictions, setPredictions] = useState<GridRowsProp[]>([]);

  useEffect(() => {
    const getOrganization = async () => {
      const responce = await fetch(`https://localhost:7029/api/v1/organizations?inns=${inn}&kpps=${kpp}`)
      if(responce.ok) {
        const result = await responce.json();
        if (result.length === 1) {
          setOrganization(result[0]);
        } else {
          setOrganization({ name: "Не удалось найти" } as Organization );
        }
      }
    };
    const getPredictions = async (yearOffset: number) => {
      const predictor = type === "provider" ? "demands" : "purchases"
      const predictedResponce = await fetch(`https://localhost:7029/api/v1/orders/predict/${predictor}?inn=${inn}&kpp=${kpp}&yearOffset=${yearOffset}`)
      if(predictedResponce.ok) {
        const scoredOrders = await predictedResponce.json() as ScoredOrder[];
        const predictedProductIds = scoredOrders.filter(p => p.order.productId !== null).map(p => p.order.productId);
        if (predictedProductIds.length !== 0) {
          const ids = predictedProductIds.sort().reduce((text, id) => `${text}&ids=${id}`, '')
          const productsResponce = await fetch(`https://localhost:7029/api/v1/products?${ids}`)
          if (productsResponce.ok) {
            const productsResult = await productsResponce.json() as Product[];
            const productsMap = productsResult.reduce((map, curr) => {
              //@ts-ignore
              map[curr.id] = curr;
              return map;
            }, {});

          return {
            scoredOrders,
            productsMap
          };
          }
        }
      }
      return {
        scoredOrders: [],
        productsMap: {}
      };
    };

    getOrganization();

    Promise.all([
      getPredictions(-3),
      getPredictions(-2),
      getPredictions(-1)
    ]).then(predict => {
      // TODO add group by id and mul to score
      const scoredOrders = [
        ...predict[0].scoredOrders,
        ...predict[1].scoredOrders,
        ...predict[2].scoredOrders
      ].sort((a,b) => b.score - a.score)
      const productsMap = {
        ...predict[0].productsMap,
        ...predict[1].productsMap,
        ...predict[2].productsMap,
      }
      const orders = scoredOrders.map(p => p.order);
      const rows = orders.map(p => rowSelector(p, productsMap));
      // @ts-ignore
      setPredictions(rows);
    });

  }, [type, inn, kpp]);

  const text = type === "provider" ? "Скоро начнутся закупки" : "Вам скоро понадоится"

  if (organization) {
    return <div>
      <h4 style={{
        textAlign: 'right'
      }}>{organization?.name}. ИНН: {inn}. КПП: {kpp}</h4>
      <h3>{text}</h3>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid rows={predictions} columns={columns} />
      </div>
    </div>
  } else {
    return <div>Loading...</div>
  }
}

export default ThunderhackProviderPage;
