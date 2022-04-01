export function NotFoundResponse(body?: BodyInit): Response {
    return new Response(body ?? "Not Found", { status: 404, statusText: "Not Found" });
}

export function BadRequestResponse(body?: BodyInit): Response {
    return new Response(body ?? "Bad Request", { status: 400, statusText: "Bad Request" });
}

export function UnauthorizedResponse(body?: BodyInit): Response {
    return new Response(body ?? "Unauthorized", { status: 401, statusText: "Unauthorized" });
}

