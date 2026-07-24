export function cart_add(data) {
  return fetch(`${routes.cart_add_url}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: data,
  }).then((res) => {
    return res.json();
  })
}

export function cart_update(data) {
  return fetch(`${routes.cart_update_url}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: data,
  })
}

export function cart_change(data) {
  return fetch(`${routes.cart_change_url}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: data,
  })
}

export function cart_remove(data) {
  return fetch(`${routes.cart_add_url}`, {
    method: "POST",
    body: data,
  })
}